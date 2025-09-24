import React from 'react';
import { makeStyles } from '@fluentui/react-components';
import { 
  ClipLoader,
  PulseLoader,
  FadeLoader,
  ScaleLoader,
  BeatLoader,
  RingLoader,
  GridLoader,
  HashLoader
} from 'react-spinners';

const useStyles = makeStyles({
  // Full screen overlay loading
  fullScreenOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.95)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 9999,
    backdropFilter: 'blur(2px)',
  },
  
  // Component overlay loading
  componentOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(255, 255, 255, 0.92)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
    backdropFilter: 'blur(1px)',
  },
  
  // Inline loading (no overlay)
  inlineLoading: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '20px',
  },
  
  // Button loading (small, inline)
  buttonLoading: {
    display: 'inline-flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginRight: '8px',
  },
  
  loadingContainer: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '16px',
    padding: '20px',
  },
  
  // Loading text styles
  loadingText: {
    fontSize: '14px',
    color: '#323130',
    fontWeight: '500',
    textAlign: 'center',
    userSelect: 'none',
    marginTop: '8px',
  },
  
  loadingSubtext: {
    fontSize: '12px',
    color: '#605e5c',
    textAlign: 'center',
    userSelect: 'none',
    marginTop: '4px',
    maxWidth: '300px',
    lineHeight: '1.4',
  },
  
  // Fade in animation
  fadeIn: {
    animation: 'fadeIn 0.3s ease-out',
  },
  
  '@keyframes fadeIn': {
    'from': { opacity: 0, transform: 'scale(0.9)' },
    'to': { opacity: 1, transform: 'scale(1)' }
  }
});

const LoadingSpinner = ({ 
  type = 'overlay', // 'fullscreen', 'overlay', 'inline', 'button'
  spinner = 'clip', // 'clip', 'pulse', 'fade', 'scale', 'beat', 'ring', 'grid', 'hash'
  text = '',
  subtext = '',
  size = 35,
  color = '#B5316A'
}) => {
  const styles = useStyles();
  
  const getContainerStyle = () => {
    switch (type) {
      case 'fullscreen':
        return `${styles.fullScreenOverlay} ${styles.fadeIn}`;
      case 'overlay':
        return `${styles.componentOverlay} ${styles.fadeIn}`;
      case 'button':
        return styles.buttonLoading;
      case 'inline':
      default:
        return styles.inlineLoading;
    }
  };
  
  const getSpinnerComponent = () => {
    const commonProps = {
      color,
      size,
      loading: true
    };
    
    switch (spinner) {
      case 'pulse':
        return <PulseLoader {...commonProps} size={size * 0.4} />;
      case 'fade':
        return <FadeLoader {...commonProps} width={5} height={15} />;
      case 'scale':
        return <ScaleLoader {...commonProps} height={size * 0.8} />;
      case 'beat':
        return <BeatLoader {...commonProps} size={size * 0.4} />;
      case 'ring':
        return <RingLoader {...commonProps} />;
      case 'grid':
        return <GridLoader {...commonProps} size={size * 0.5} />;
      case 'hash':
        return <HashLoader {...commonProps} />;
      case 'clip':
      default:
        return <ClipLoader {...commonProps} />;
    }
  };
  
  const showText = text && type !== 'button';
  
  return (
    <div className={getContainerStyle()}>
      <div className={styles.loadingContainer}>
        {getSpinnerComponent()}
        {showText && (
          <>
            <div className={styles.loadingText}>{text}</div>
            {subtext && <div className={styles.loadingSubtext}>{subtext}</div>}
          </>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;