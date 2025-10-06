import React from 'react';
import { makeStyles } from '@fluentui/react-components';
import { ChevronRightRegular, HomeRegular } from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    backgroundColor: '#B5316A',
    borderBottom: '1px solid rgba(255, 255, 255, 0.1)',
    padding: '0 40px',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
  },
  pageTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: 'white',
    margin: '20px 0 12px 0',
    lineHeight: '1.2',
  },
  pageTitleCenter: {
    textAlign: 'center',
  },
  pageTitleLeft: {
    textAlign: 'left',
  },
  breadcrumbNav: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '8px',
    paddingBottom: '16px',
    fontSize: '14px',
    color: '#B5316A',
    backgroundColor: '#f8f8f8',
    padding: '12px 20px',
    margin: '0 -40px -16px -40px',
    borderRadius: '0',
  },
  breadcrumbItems: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  breadcrumbItem: {
    display: 'flex',
    alignItems: 'center',
    cursor: 'pointer',
    color: '#B5316A',
    textDecoration: 'none',
    padding: '4px 8px',
    borderRadius: '4px',
    transition: 'background-color 0.2s ease, color 0.2s ease',
    '&:hover': {
      backgroundColor: 'rgba(181, 49, 106, 0.1)',
      color: '#9e2c5f',
    }
  },
  breadcrumbCurrent: {
    color: '#323130',
    cursor: 'default',
    '&:hover': {
      backgroundColor: 'transparent',
      color: '#323130',
    }
  },
  breadcrumbIcon: {
    fontSize: '16px',
    marginRight: '6px',
  },
  separator: {
    color: '#8a8886',
    fontSize: '12px',
    display: 'flex',
    alignItems: 'center',
  },
  actionButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    padding: '8px 16px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  }
});

const Breadcrumb = ({
  pageTitle,
  breadcrumbs = [],
  actionButton,
  onNavigate,
  titleAlign = 'center' // 'center' or 'left'
}) => {
  const styles = useStyles();

  // Don't render anything if no pageTitle is provided (for Dashboard)
  if (!pageTitle) {
    return null;
  }

  const handleBreadcrumbClick = (breadcrumb) => {
    if (breadcrumb.onClick) {
      breadcrumb.onClick();
    } else if (onNavigate) {
      onNavigate(breadcrumb.path || breadcrumb.href);
    }
  };

  const titleClassName = `${styles.pageTitle} ${
    titleAlign === 'left' ? styles.pageTitleLeft : styles.pageTitleCenter
  }`;

  return (
    <div className={styles.container}>
      <h1 className={titleClassName}>{pageTitle}</h1>
      {(breadcrumbs.length > 0 || actionButton) && (
        <nav className={styles.breadcrumbNav}>
          <div className={styles.breadcrumbItems}>
            {breadcrumbs.map((breadcrumb, index) => (
              <React.Fragment key={index}>
                <span
                  className={`${styles.breadcrumbItem} ${
                    breadcrumb.current ? styles.breadcrumbCurrent : ''
                  }`}
                  onClick={() => !breadcrumb.current && handleBreadcrumbClick(breadcrumb)}
                >
                  {breadcrumb.icon && (
                    <span className={styles.breadcrumbIcon}>
                      {breadcrumb.icon}
                    </span>
                  )}
                  {breadcrumb.label}
                </span>
                {index < breadcrumbs.length - 1 && (
                  <span className={styles.separator}>
                    <ChevronRightRegular />
                  </span>
                )}
              </React.Fragment>
            ))}
          </div>
          {actionButton && (
            <button
              className={styles.actionButton}
              onClick={actionButton.onClick}
              type="button"
            >
              {actionButton.icon && actionButton.icon}
              {actionButton.label}
            </button>
          )}
        </nav>
      )}
    </div>
  );
};

export default Breadcrumb;