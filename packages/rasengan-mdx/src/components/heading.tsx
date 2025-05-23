import { createElement, useMemo } from 'react';
import { HeadingProps, HeadingProps2 } from '../types/index.js';
import { generateAnchor } from '../utils/extract-toc.js';

export const Heading = ({ variant }: HeadingProps) => {
  return ({ children }: HeadingProps2) => {
    const { text, id } = useMemo(() => {
      const { id, text } = generateAnchor(children);

      return {
        id: variant === 'h1' ? undefined : id,
        text,
      };
    }, [children]);

    const heading = createElement(variant, {
      id,
      className: 'heading',
      children: text,
    });

    const handleClick = (
      e: React.MouseEvent<HTMLAnchorElement, MouseEvent>,
      id: string
    ) => {
      e.preventDefault();

      const element = document.getElementById(id);
      element?.scrollIntoView({ behavior: 'smooth' });

      history.pushState(null, '', `#${id}`); // Update the URL
    };

    return (
      <div className="ra-heading-wrapper">
        {heading}
        {id && (
          <a href={`#${id}`} onClick={(e) => handleClick(e, id)}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              width="24"
              height="24"
              color="#ffffff"
              fill="none"
            >
              <path
                d="M10 13.229C10.1416 13.4609 10.3097 13.6804 10.5042 13.8828C11.7117 15.1395 13.5522 15.336 14.9576 14.4722C15.218 14.3121 15.4634 14.1157 15.6872 13.8828L18.9266 10.5114C20.3578 9.02184 20.3578 6.60676 18.9266 5.11718C17.4953 3.6276 15.1748 3.62761 13.7435 5.11718L13.03 5.85978"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
              <path
                d="M10.9703 18.14L10.2565 18.8828C8.82526 20.3724 6.50471 20.3724 5.07345 18.8828C3.64218 17.3932 3.64218 14.9782 5.07345 13.4886L8.31287 10.1172C9.74413 8.62761 12.0647 8.6276 13.4959 10.1172C13.6904 10.3195 13.8584 10.539 14 10.7708"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </a>
        )}
      </div>
    );
  };
};
