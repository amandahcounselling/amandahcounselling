import { useEffect } from 'react';
import type { CaptchaProvider } from '../config';

type CaptchaFieldProps = {
  captcha: {
    enabled: boolean;
    provider: CaptchaProvider;
    siteKey: string;
  };
};

const scriptByProvider: Record<CaptchaProvider, { id: string; src: string }> = {
  'google-recaptcha': {
    id: 'google-recaptcha-script',
    src: 'https://www.google.com/recaptcha/api.js',
  },
  hcaptcha: {
    id: 'hcaptcha-script',
    src: 'https://js.hcaptcha.com/1/api.js',
  },
};

export default function CaptchaField({ captcha }: CaptchaFieldProps) {
  useEffect(() => {
    if (!captcha.enabled || !captcha.siteKey) {
      return;
    }

    const script = scriptByProvider[captcha.provider];

    if (document.getElementById(script.id)) {
      return;
    }

    const element = document.createElement('script');
    element.id = script.id;
    element.src = script.src;
    element.async = true;
    element.defer = true;
    document.head.appendChild(element);
  }, [captcha.enabled, captcha.provider, captcha.siteKey]);

  if (!captcha.enabled) {
    return null;
  }

  if (!captcha.siteKey) {
    return (
      <p className="text-destructive text-sm">
        Captcha is enabled, but no site key is configured in site.ts.
      </p>
    );
  }

  if (captcha.provider === 'google-recaptcha') {
    return <div className="g-recaptcha" data-sitekey={captcha.siteKey} />;
  }

  return <div className="h-captcha" data-sitekey={captcha.siteKey} />;
}
