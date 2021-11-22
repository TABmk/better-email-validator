import { RFC5322 } from "../extra/rfc";
import { escapeRegExp } from "../extra/utils";
import { whiteList } from "../extra/whitelist";

interface IEmailValidator {
  regex?: RegExp;
  allowTags?: boolean;
  allowDots?: boolean;
  allowSubdomain?: boolean;
  dotsRegEx?: RegExp;
  tagSymbols?: Array<string>;
  tagRegExPattern?: string;
  details?: boolean;
  domains?: Array<string>;
  allowOnlyWhiteList?: boolean;
}

interface IDetails {
  result: boolean,
  errorCode: string,
  errorInfo: string,
}

const Defaults: IEmailValidator = {
  regex: RFC5322,
  dotsRegEx: /[.](?=.*[@])/g,
  allowDots: true,
  allowTags: true,
  allowSubdomain: true,
  tagSymbols: [ '+' ],
  tagRegExPattern: '(%TAG%.*)@',
  details: false,
  domains: [],
  allowOnlyWhiteList: false,
}

export class EmailValidator {
  regex: RegExp;
  dotsRegEx: RegExp;
  tagSymbols: Array<string>;
  tagRegExPattern: string;
  allowTags: boolean;
  allowDots: boolean;
  allowSubdomain: boolean;
  details: boolean;
  domains: Array<string>;
  allowOnlyWhiteList: boolean;

  constructor(params?: IEmailValidator) {
    Object.assign(this, Defaults, params);

    if (!this.allowTags && !this.tagSymbols.length) {
      throw new Error('[tagSymbols] can not be empty when [allowTags] is false!');
    }

    if (this.allowOnlyWhiteList) {
      Object.assign(this.domains, whiteList);
    }

    this.tagSymbols.forEach((tag) => {
      if (!tag.length) {
        throw new Error('tag from [tagSymbols] can not be empty string');
      }
    });

    this.domains.forEach((domain, i) => {
      if (!domain.length) {
        throw new Error('domain from [domains] can not be empty string');
      }

      this.domains[i] = domain.toLocaleLowerCase();
    });
  }

  private detailsBuilder (result: boolean, errorCode: string, errorInfo = '') {
    if (this.details) {
      return {
        result,
        errorCode,
        errorInfo,
      }
    }

    return result;
  }

  getDomain (email: string) {
    return email.match(/(?<=@)[^.]+(?=\.).*/)?.[0] || null;
  }

  checkSubDomain (email: string) {
    return email.match(/\./g)?.length > 1;
  }

  checkDots (email: string) {
    return email.match(this.dotsRegEx)?.length || 0;
  }

  checkTags (email: string) {
    for (let i = 0; i < this.tagSymbols.length; i += 1) {
      if (new RegExp(
        this.tagRegExPattern.replace(
          '%TAG%',
          escapeRegExp(this.tagSymbols[i])
        )
      ).test(email)) {
        return this.tagSymbols[i];
      }
    }

    return '';
  }

  removeDots (email: string) {
    return email.replace(this.dotsRegEx, '');
  }

  removeTag (email: string) {
    this.tagSymbols.forEach((tag) => {
      email = email.replace(
        new RegExp(
          this.tagRegExPattern.replace('%TAG%', escapeRegExp(tag))
        ),
        '@'
      );
    });

    return email;
  }

  clear (email: string, strict = true) {
    if (!this.allowDots || !strict) {
      email = this.removeDots(email);
    }
    if (!this.allowTags || !strict) {
      email = this.removeTag(email);
    }  
    return email;
  }

  compare (email1: string, email2: string, strict = true) {
    return this.clear(email1.toLocaleLowerCase(), strict) === this.clear(email2.toLocaleLowerCase(), strict);
  }

  validate (email: string): boolean | IDetails {
    if (!this.allowSubdomain && this.checkSubDomain(email)) {
      return this.detailsBuilder(false, 'subdomain', this.getDomain(email));
    }

    const dots = this.checkDots(email);
    if (dots >= 1 && !this.allowDots) {
      return this.detailsBuilder(false, 'dots', `Dots count: ${dots}`);
    }

    const tag = this.checkTags(email);
    if (tag.length && !this.allowTags) {
      return this.detailsBuilder(false, 'tag', tag);
    }

    if (this.domains.length) {
      const domain = this.getDomain(email).toLocaleLowerCase();
      
      if (!this.domains.includes(domain)) {
        return this.detailsBuilder(false, 'domain', domain);
      }
    }

    if (!this.regex.test(email)) {
      return this.detailsBuilder(false, 'regex');
    }

    return this.detailsBuilder(true, 'ok');
  }
}