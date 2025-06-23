import './Monochrome-static.css';

const MonochromeStatic = () => {
  return (
    <div className="tagline-static">
      <span className="tagline-brand-static">
        <div className="slot-small-static">
          <div className="slot-item static-s">S</div>
        </div>
        &nbsp;
        <span className="tagline-text-small-static underline" style={{ fontSize: '12px', textDecoration: 'underline' }}>
          My size
        </span>
      </span>
    </div>
  );
};

export default MonochromeStatic;
