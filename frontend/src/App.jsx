import React from 'react';
import {
  FluentProvider,
  webLightTheme,
  webDarkTheme,
  Text,
  Card,
  CardHeader,
  CardPreview,
  Button,
  Avatar,
  Badge,
  Divider,
  makeStyles,
  tokens,
  Body1,
  Caption1,
  Title1,
  Title2,
  Title3
} from '@fluentui/react-components';
import {
  BuildingRegular,
  PeopleRegular,
  DocumentRegular,
  CalendarRegular,
  PersonRegular,
  HomeRegular,
  SettingsRegular
} from '@fluentui/react-icons';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    minHeight: '100vh',
    backgroundColor: '#F3F2F1',
    fontFamily: 'Segoe UI, sans-serif',
  },
  header: {
    backgroundColor: '#464775',
    padding: '16px 24px',
    borderBottom: '1px solid #E1DFDD',
    boxShadow: '0 1px 2px rgba(0,0,0,0.1)',
  },
  headerContent: {
    display: 'flex',
    alignItems: 'center',
    maxWidth: '1200px',
    margin: '0 auto',
  },
  logoIcon: {
    fontSize: '32px',
    color: 'white',
    marginRight: '12px',
  },
  appTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: 'white',
    margin: 0,
  },
  content: {
    flex: 1,
    padding: '32px 24px',
    maxWidth: '1200px',
    margin: '0 auto',
    width: '100%',
  },
  welcomeSection: {
    backgroundColor: 'white',
    borderRadius: '4px',
    padding: '32px',
    marginBottom: '24px',
    border: '1px solid #E1DFDD',
    boxShadow: '0 1px 2px rgba(0,0,0,0.04)',
  },
  welcomeHeader: {
    marginBottom: '20px',
  },
  welcomeTitle: {
    fontSize: '28px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 8px 0',
  },
  welcomeSubtitle: {
    fontSize: '16px',
    color: '#605E5C',
    margin: 0,
  },
  description: {
    fontSize: '14px',
    lineHeight: '1.5',
    color: '#323130',
    marginBottom: '32px',
    maxWidth: '800px',
  },
  actionsContainer: {
    display: 'flex',
    gap: '12px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  primaryButton: {
    backgroundColor: '#6264A7',
    color: 'white',
    border: 'none',
    borderRadius: '2px',
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '600',
    fontFamily: 'Segoe UI, sans-serif',
    cursor: 'pointer',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#464775',
    },
    '&:focus': {
      outline: '2px solid #6264A7',
      outlineOffset: '2px',
    }
  },
  secondaryButton: {
    backgroundColor: 'white',
    color: '#323130',
    border: '1px solid #8A8886',
    borderRadius: '2px',
    padding: '8px 20px',
    fontSize: '14px',
    fontWeight: '400',
    fontFamily: 'Segoe UI, sans-serif',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      backgroundColor: '#F3F2F1',
      borderColor: '#323130',
    },
    '&:focus': {
      outline: '2px solid #6264A7',
      outlineOffset: '2px',
    }
  },
  statsContainer: {
    display: 'flex',
    gap: '24px',
    marginBottom: '32px',
    flexWrap: 'wrap',
  },
  statCard: {
    backgroundColor: 'white',
    border: '1px solid #E1DFDD',
    borderRadius: '4px',
    padding: '16px',
    minWidth: '140px',
    textAlign: 'center',
  },
  statIcon: {
    fontSize: '24px',
    color: '#6264A7',
    marginBottom: '8px',
  },
  statTitle: {
    fontSize: '14px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 4px 0',
  },
  statDescription: {
    fontSize: '12px',
    color: '#605E5C',
    margin: 0,
  },
  featuresContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))',
    gap: '16px',
    marginTop: '24px',
  },
  featureCard: {
    backgroundColor: 'white',
    border: '1px solid #E1DFDD',
    borderRadius: '4px',
    padding: '20px',
    cursor: 'pointer',
    transition: 'all 0.2s ease',
    '&:hover': {
      borderColor: '#6264A7',
      boxShadow: '0 2px 8px rgba(0,0,0,0.1)',
    }
  },
  featureIcon: {
    fontSize: '32px',
    color: '#6264A7',
    marginBottom: '12px',
  },
  featureTitle: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 8px 0',
  },
  featureDescription: {
    fontSize: '14px',
    color: '#605E5C',
    lineHeight: '1.4',
    margin: 0,
  }
});

function App() {
  const styles = useStyles();

  const features = [
    {
      title: "Member Records",
      description: "Manage congregation member information and details",
      icon: <PeopleRegular />
    },
    {
      title: "Reports & Analytics",
      description: "Generate comprehensive reports and track church activities",
      icon: <DocumentRegular />
    },
    {
      title: "Event Management",
      description: "Schedule and organize church events and services",
      icon: <CalendarRegular />
    },
    {
      title: "Administration",
      description: "Handle administrative tasks and church governance",
      icon: <SettingsRegular />
    }
  ];

  return (
    <FluentProvider theme={webLightTheme}>
      <div className={styles.container}>
        {/* Header Bar - Teams Style */}
        <div className={styles.header}>
          <div className={styles.headerContent}>
            <BuildingRegular className={styles.logoIcon} />
            <h1 className={styles.appTitle}>Ecclesia - Church Management System</h1>
          </div>
        </div>

        {/* Main Content */}
        <div className={styles.content}>
          {/* Welcome Section */}
          <div className={styles.welcomeSection}>
            <div className={styles.welcomeHeader}>
              <h2 className={styles.welcomeTitle}>Welcome to Ecclesia</h2>
              <p className={styles.welcomeSubtitle}>Church of South India - Administrative Platform</p>
            </div>
            
            <p className={styles.description}>
              Ecclesia is specifically designed for the Church of South India, providing powerful tools to manage your congregation,
              track member records, generate insightful reports, and streamline administrative processes.
              Built with modern technology to serve your church community effectively.
            </p>

            {/* Action Buttons */}
            <div className={styles.actionsContainer}>
              <button className={styles.primaryButton}>
                <HomeRegular style={{ marginRight: '6px', fontSize: '16px' }} />
                Get Started
              </button>
              <button className={styles.secondaryButton}>
                <PersonRegular style={{ marginRight: '6px', fontSize: '16px' }} />
                View Members
              </button>
              <button className={styles.secondaryButton}>
                <DocumentRegular style={{ marginRight: '6px', fontSize: '16px' }} />
                Generate Reports
              </button>
            </div>

            {/* Quick Stats */}
            <div className={styles.statsContainer}>
              <div className={styles.statCard}>
                <PeopleRegular className={styles.statIcon} />
                <h3 className={styles.statTitle}>Members</h3>
                <p className={styles.statDescription}>Manage congregation</p>
              </div>
              <div className={styles.statCard}>
                <DocumentRegular className={styles.statIcon} />
                <h3 className={styles.statTitle}>Reports</h3>
                <p className={styles.statDescription}>Track activities</p>
              </div>
              <div className={styles.statCard}>
                <CalendarRegular className={styles.statIcon} />
                <h3 className={styles.statTitle}>Events</h3>
                <p className={styles.statDescription}>Schedule services</p>
              </div>
            </div>
          </div>

          {/* Features Grid */}
          <div className={styles.featuresContainer}>
            {features.map((feature, index) => (
              <div key={index} className={styles.featureCard}>
                <div className={styles.featureIcon}>
                  {React.cloneElement(feature.icon, { className: styles.featureIcon })}
                </div>
                <h3 className={styles.featureTitle}>{feature.title}</h3>
                <p className={styles.featureDescription}>{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </div>
    </FluentProvider>
  );
}

export default App;
