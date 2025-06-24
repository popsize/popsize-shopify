import { useEffect, useRef } from 'react';
import './SlotS-large.css';
import { useTranslation } from 'react-i18next';

const sizes = [
  'XS', 'S', 'M', 'L', 'XL',
  '32', '34', '36', '38', '40', '42',
  'W28', 'W29', 'W30', 'W31', 'W32',
  '85B', '90D', '100C', '105A', '110B'
];

const itemHeight = 40;

const SlotSLarge = () => {
  const slotTrackRef = useRef<HTMLDivElement>(null);
  const { t } = useTranslation();

  const shuffle = (array: string[]) => {
    return array
      .map(value => ({ value, sort: Math.random() }))
      .sort((a, b) => a.sort - b.sort)
      .map(({ value }) => value);
  };

  useEffect(() => {
    const slotTrack = slotTrackRef.current;
    if (!slotTrack) return;
  
    const runAnimation = () => {
      if (!slotTrackRef.current) return;
  
      // Clear previous items
      slotTrack.innerHTML = '';
  
      // Shuffle and append items
      const contentList = shuffle([...sizes]);
      contentList.forEach((item) => {
        const div = document.createElement('div');
        div.className = 'slot-item';
        div.textContent = item;
        slotTrack.appendChild(div);
      });
  
      // Append final "S"
      const finalS = document.createElement('div');
      finalS.className = 'slot-item final-s';
      finalS.textContent = 'S';
      slotTrack.appendChild(finalS);
  
      const durationMs = 2000;
      const startTime = performance.now();
      const scrollDistance = (contentList.length) * itemHeight;
      const easeOutQuad = (t: number) => 1 - (1 - t) * (1 - t);
  
      const scrollFrame = (now: number) => {
        if (!slotTrackRef.current) return;
        const elapsed = now - startTime;
        const progress = Math.min(elapsed / durationMs, 1);
        const easedProgress = easeOutQuad(progress);
        const position = scrollDistance * easedProgress;
  
        slotTrackRef.current.style.transform = `translateY(-${position}px)`;
  
        if (progress < 1) {
          requestAnimationFrame(scrollFrame);
        } else {
          // Restart after 3 seconds
          setTimeout(runAnimation, 3000);
        }
      };
  
      requestAnimationFrame(scrollFrame);
    };
  
    // Start initial animation after 1 second
    const timeout = setTimeout(runAnimation, 0);
  
    return () => clearTimeout(timeout); // Cleanup on unmount
  }, []);
  

  return (
    <div className="slot-wrapper-large bg-popsizeGradientPrimary10Secondary10 shadow-lg">
    <div className="tagline">
      <span className="tagline-text-large">{t('my_size_long')}</span>
      <span className="tagline-brand">
        <span className="brand-part">pop</span>
        <div className="slot-large">
          <div className="slot-track" ref={slotTrackRef}></div>
        </div>
        <span className="brand-part">ize</span>
      </span>
    </div>
  </div>
  );
};

export default SlotSLarge;
