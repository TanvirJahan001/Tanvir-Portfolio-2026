'use client';
import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import { projects } from '@/lib/content';

export default function WorkList() {
  const [touchPreview, setTouchPreview] = useState('');
  return (
    <div className="work-list">
      {projects.map((project, i) => (
        <article key={project.slug} className="work-entry">
          <Link
            href={'/projects/' + project.slug}
            className="work-row"
            onPointerMove={(e) => {
              if (e.pointerType !== 'mouse') return;
              const el = e.currentTarget,
                box = el.getBoundingClientRect();
              el.style.setProperty(
                '--preview-x',
                Math.min(Math.max(160, e.clientX - box.left), box.width - 160) +
                  'px',
              );
              el.style.setProperty('--preview-y', e.clientY - box.top + 'px');
            }}
          >
            <small className="work-no">0{i + 1}</small>
            <div className="row-main">
              <h3>{project.title}</h3>
              <p>{project.summary}</p>
            </div>
            <div className="work-meta">
              {project.category}
              <span>• {project.status}</span>
            </div>
            <span className="row-arrow" aria-hidden="true">
              →
            </span>
            <div className="hover-print" aria-hidden="true">
              <Image
                src={'/projects/' + project.image + '.webp'}
                width={440}
                height={280}
                alt=""
                sizes="300px"
              />
              <span>View project ↗</span>
            </div>
          </Link>
          <button
            className="touch-preview"
            aria-expanded={touchPreview === project.slug}
            aria-controls={'preview-' + project.slug}
            onClick={() =>
              setTouchPreview(touchPreview === project.slug ? '' : project.slug)
            }
          >
            {touchPreview === project.slug ? 'Hide preview' : 'Preview image'}
          </button>
          <div
            id={'preview-' + project.slug}
            hidden={touchPreview !== project.slug}
            className="touch-image"
          >
            <Image
              src={'/projects/' + project.image + '.webp'}
              width={660}
              height={420}
              alt={project.alt}
              sizes="90vw"
            />
          </div>
        </article>
      ))}
    </div>
  );
}
