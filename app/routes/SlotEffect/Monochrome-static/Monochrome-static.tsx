import './Monochrome-static.css';
import { useTranslation } from 'react-i18next';

const MonochromeStatic = () => {
  const { t } = useTranslation();
  
  return (
    <div className="tagline-static">
      <span className="tagline-brand-static">
        <div className="slot-small-static">
          <div className="slot-item static-s">S</div>
        </div>
        &nbsp;
        <span className="tagline-text-small-static underline" style={{ fontSize: '12px', textDecoration: 'underline' }}>
          {t('my_size_short')}
        </span>
      </span>
    </div>
  );
};

export default MonochromeStatic;
