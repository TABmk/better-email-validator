import { RFC5322, EmailValidator } from "./index";

const ev = new EmailValidator({
  regex: RFC5322,
  allowDots: false,
  details: true
});

console.log(ev.validate('a.s+d@zgmail.com'));