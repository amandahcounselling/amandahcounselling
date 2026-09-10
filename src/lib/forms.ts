import { siteConfig, type FormKind } from '../config';

export function getFormSettings(kind: FormKind) {
  const backend = siteConfig.forms.backend;
  const provider = siteConfig.forms.providers[backend];

  return {
    backend,
    action: provider.action,
    captcha: siteConfig.forms.captcha,
    isDisabled: backend === 'disabled',
    isBasic: backend === 'basic',
    hidesForm: backend === 'disabled' || backend === 'basic',
    isDemo: backend === 'demo' || !provider.action,
  };
}

export function getFormSubject(kind: FormKind) {
  if (kind === 'booking') {
    return `Consultation request for ${siteConfig.practiceName}`;
  }

  if (kind === 'session') {
    return `Session booking request for ${siteConfig.practiceName}`;
  }

  return `Contact form message for ${siteConfig.practiceName}`;
}
