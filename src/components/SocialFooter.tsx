import React from 'react';
import { motion } from 'motion/react';

export default function SocialFooter() {
  const socials = [
    {
      id: 'instagram',
      name: 'Instagram',
      url: 'https://www.instagram.com/invites/contact/?utm_source=ig_contact_invite&utm_medium=copy_link&utm_content=j8ei3ob',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <rect x="2" y="2" width="20" height="20" rx="5" ry="5" />
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z" />
          <line x1="17.5" y1="6.5" x2="17.51" y2="6.5" />
        </svg>
      ),
      hoverColor: 'hover:text-amber-500 hover:border-amber-500 dark:hover:text-amber-400 dark:hover:border-amber-400',
    },
    {
      id: 'tiktok',
      name: 'TikTok',
      url: 'https://www.tiktok.com/@reed.by.s?_r=1&_t=ZS-96cTGUmlzO9',
      icon: (
        <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
          <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.02 1.59 4.23.95 1.15 2.29 1.95 3.75 2.27v3.91c-1.22-.04-2.42-.4-3.5-1.04-.63-.38-1.2-.87-1.68-1.45v7.6c.07 1.83-.56 3.65-1.72 5.04-1.35 1.62-3.4 2.51-5.5 2.45-2.04-.04-4.01-.96-5.28-2.55-1.43-1.75-2-4.09-1.55-6.3.43-2.18 1.96-4.03 4.02-4.82.91-.35 1.89-.48 2.86-.4v3.86c-.5-.07-1.01.01-1.47.22-.92.42-1.59 1.28-1.78 2.28-.24 1.23.36 2.51 1.43 3.12.87.5 1.96.48 2.81-.06.77-.49 1.14-1.4 1.12-2.31l-.01-14.82c0-.4.01-.4.01-.4z" />
        </svg>
      ),
      hoverColor: 'hover:text-cyan-500 hover:border-cyan-500 dark:hover:text-cyan-400 dark:hover:border-cyan-400',
    },
    {
      id: 'facebook',
      name: 'Facebook',
      url: 'https://www.facebook.com/share/18pRVxV5rM/',
      icon: (
        <svg className="w-4 h-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round">
          <path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z" />
        </svg>
      ),
      hoverColor: 'hover:text-blue-550 hover:border-blue-550 dark:hover:text-blue-400 dark:hover:border-blue-400',
    },
  ];

  return (
    <div className="flex flex-col items-center justify-center space-y-4 py-4" id="social-footer-container">
      <span className="text-[8px] uppercase tracking-[0.3em] font-mono text-neutral-450 dark:text-neutral-500 block font-bold">
        Connect via Official Channels
      </span>
      <div className="flex items-center justify-center gap-3.5 sm:gap-4">
        {socials.map((social) => (
          <motion.a
            key={social.id}
            href={social.url}
            target="_blank"
            rel="noopener noreferrer"
            whileHover={{ y: -3, scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            className={`group flex items-center gap-2 px-5 py-2.5 rounded-full border border-neutral-200 dark:border-neutral-800 text-neutral-600 dark:text-neutral-400 bg-neutral-50 dark:bg-neutral-900/40 font-mono text-[10px] sm:text-[11px] font-extrabold tracking-[0.16em] uppercase shadow-xs transition-colors duration-250 ${social.hoverColor}`}
            id={`social-footer-link-${social.id}`}
          >
            <span className="shrink-0">{social.icon}</span>
            <span>{social.name}</span>
          </motion.a>
        ))}
      </div>
    </div>
  );
}
