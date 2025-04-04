[<img src="https://img.shields.io/npm/v/better-email-validator">](https://www.npmjs.com/package/better-email-validator) [<img src="https://img.shields.io/npm/l/better-email-validator">](https://github.com/TABmk/better-email-validator/blob/master/LICENSE) <img src="https://badgen.net/npm/types/better-email-validator">

<img src="https://badgen.net/npm/dt/better-email-validator">
<img src="https://badgen.net/npm/dm/better-email-validator">

__Help__ [<img src="https://img.shields.io/github/issues/tabmk/better-email-validator">](https://github.com/TABmk/better-email-validator/issues?q=is%3Aopen+is%3Aissue) [<img src="https://img.shields.io/github/issues-pr/tabmk/better-email-validator">](https://github.com/TABmk/better-email-validator/pulls?q=is%3Aopen+is%3Apr)

#### __Rate__ [<img src="https://img.shields.io/github/stars/tabmk/better-email-validator?style=social">](https://github.com/TABmk/better-email-validator)

# __BETTER-EMAIL-VALIDATOR__ 📧

Zero-dependency <img src="https://badgen.net/bundlephobia/dependency-count/better-email-validator">

lightweigh <img src="https://badgen.net/bundlephobia/minzip/better-email-validator">

📨 Email adress validator with extra features 🛠

---
# ⚠️ Disclaimer ⚠️
Read license before use it!

---
# How can u help / TODO

It would be awesome if you help with something of this:

- Add new regexp [here](https://github.com/TABmk/better-email-validator/blob/master/extra/rfc.ts)
- Add new domains to build-in whitelist [here](https://github.com/TABmk/better-email-validator/blob/master/extra/whitelist.ts)
- Test existing prepared regex
- Test existing tools (methods)
- Write tests
- Add new tools for emails
- Make Readme better (i'll add TypeDoc soon, maybe)
- Add JSDocs
- Fix mistakes in Readme
- Add code examples

---
You can compile .js files by command `yarn build` or `npm run build`

And run example with `yarn example` or `npm run example`

---

## __Install__
```
npm i better-email-validator

    or

yarn add better-email-validator
```

## __Usage__

### Import
```
import { RFC5322, RFC822, EmailValidator } from 'better-email-validator';

    or

const { RFC5322, RFC822, EmailValidator } = require('better-email-validator');
```

### RFC
`RFC5322` and `RFC822` are constant variables which contains implementation of specifications. Both `RegExp`

### EmailValidator
This is main class which contains all methods

Create new instance:
```
const EV = new EmailValidator({
  // params
});
```

#### Params
| Param | Description | Type | Default |
| -- | -- | -- | -- |
| regex | Main checker. Pass own regexp or use prepared `RFC5322` or `RFC822` | RegExp | `RFC5322` |
| dotsRegEx | Regex for checking dots in name | RegExp | `/[.](?=.*[@])/g` |
| allowDots | Is dots allowed in name | boolean | `true` |
| allowTags | Is tags allowed in name (aa`+bb`@ccc.dd) | boolean | `true` |
| allowSubdomain | Is subdomains allowed in domain | boolean | `true` |
| tagSymbols | List of chars for tags. (Ex.: `+` for Gmail, `-` for qmail, etc) | Array<string> | `[ '+' ]` |
| tagRegExPattern | Regex pattern for tags check | string | `'(%TAG%.*)@'` |
| details | false = methods return only boolean. true = object (check `IDetails` below)  | boolean | `false` |
| allowOnlyWhiteList | Allow only whitelisted domains. Check `extra/whitelist.ts` | boolean | `false` |
| domains | If `allowOnlyWhiteList` = true, expands it. If not = this array counts as whitelist | Array<string> | `[]` |

##### IDetails
```
interface IDetails {
  result: boolean,
  errorCode: string, // 'ok' if result 'true'
  errorInfo: string, // empty if result 'true'
}
```

#### Examples
```
const EV = new EmailValidator({
  domains: [ 'tab.mk' ],
  allowOnlyWhiteList: true,
  allowDots: false,
  details: true,
});

// domain whitelisted (wl expanded by 'domains')
EV.validate('someemail@tab.mk');
// => {
//      result: true,
//      errorCode: 'ok',
//      errorInfo: ''
//    }

// domain not whitelisted
EV.validate('someemail@unknown.domain');
// => {
//      result: false,
//      errorCode: 'domain',
//      errorInfo: 'unknown.domain'
//    }

// domain whitelisted (from build-in wl), but dots in name
EV.validate('s.o.m.e.email@gmail.com');
// => {
//      result: false,
//      errorCode: 'dots',
//      errorInfo: 'Dots count: 4'
//    }
```

### Methods
#### validate (email: string): string
Checks for
|Name|Condition|errorCode|
|--|--|--|
|subdomain|allowSubdomain === false && checkSubDomain === true|subdomain|
|dots|checkDots => 1 && allowDots === false|dots|
|tag|checkTags.length && allowTags === false|tag|
|whitelist|domains.length && domains.includes|domain|
|main regex|regex.test|regex|

success return `true` or `{result: true, errorCode: 'ok', errorInfo: ''}` if details enabled

Example:
```
EV.validate('aaa@aa.aa');
// => true

EV.validate('aaa@aa.aa'); // with build-in whitelist + details
// => {
//      result: false,
//      errorCode: 'domain',
//      errorInfo: 'aa.aa'
//    }
```

#### compare (email1: string, email2: string, strict = true): boolean
Compares two emails with considering instance params. Params can be ignored by passing `false` as third param

Example:
```
EV.compare('AAA.bb+cc@gmail.com', 'aaabb@gmail.com');
// => false

EV.compare('AAA.bb+cc@gmail.com', 'aaabb@gmail.com', false);
// => true
```
#### clear (email: string, strict = true): string
Clears email with considering instance params. Params can be ignored by passing `false` as third param

Example
```
// allowDots: false
EV.clear('AAA.bb+cc@gmail.com');
// => AAAbb+cc@gmail.com

// allowTags: false
EV.clear('AAA.bb+cc@gmail.com');
// => AAA.bb@gmail.com

EV.clear('AAA.bb+cc@gmail.com', false);
// => AAAbb@gmail.com
```
#### getDomain (email: string): string
Returns domain from email address

Example:
```
EV.getDomain('aaa@gmail.com');
// => gmail.com
```
#### checkSubDomain (email: string): boolean
Returns `true` if email domain contains subdomain

Example:
```
EV.getDomain('aaa@gmail.com');
// => false

EV.getDomain('aaa@xxx.gmail.com');
// => true
```
#### checkDots (email: string): number
Returns number of dots in name
Example:
```
EV.getDomain('aaa@gmail.com');
// => 0

EV.getDomain('a.a.a@gmail.com');
// => 2
```
#### checkTags (email: string): string
Returns first found tag in name or empty string if nothing found

Example:
```
EV.getDomain('aaa@gmail.com');
// => ''

// with default settings
EV.getDomain('aaa+bb@gmail.com');
// => '+'

// tagSymbols: [ '-', '+' ]
EV.getDomain('aaa-bb+cc@gmail.com');
// => '-'
// first match only
```
#### removeDots (email: string): string
Returns cleared email from dots
Example:
```
EV.removeDots('a.a.a@gmail.com');
// => 'aaa@gmail.com'
```
#### removeTag (email: string): string
Returns cleared email from tags
Example:
```
EV.removeDots('aaa+bb@gmail.com');
// => 'aaa@gmail.com'

// tagSymbols: [ '-', '+' ]
EV.removeDots('aaa=bb-cc+dd@gmail.com');
// => 'aaa=bb@gmail.com'
```
