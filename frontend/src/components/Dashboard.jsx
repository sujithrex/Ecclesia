import React, { useState, useEffect } from 'react';
import { makeStyles } from '@fluentui/react-components';
import StatusBar from './StatusBar';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    height: 'calc(100vh - 32px)', /* Account for title bar */
    backgroundColor: '#f8f8f8',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    overflow: 'hidden',
    flexDirection: 'column',
  },
  main: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: 'white',
    margin: '20px',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
  },
  welcomeContainer: {
    textAlign: 'center',
    maxWidth: '600px',
    padding: '40px',
  },
  welcomeTitle: {
    fontSize: '48px',
    fontWeight: '300',
    color: '#B5316A',
    margin: '0 0 16px 0',
    fontFamily: 'Meribold, Segoe UI, sans-serif',
  },
  welcomeSubtitle: {
    fontSize: '24px',
    fontWeight: '400',
    color: '#323130',
    margin: '0 0 24px 0',
  },
  welcomeMessage: {
    fontSize: '16px',
    color: '#605e5c',
    lineHeight: '1.5',
    marginBottom: '32px',
  },
  userInfo: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '16px',
    padding: '20px',
    backgroundColor: '#f8f8f8',
    borderRadius: '8px',
    border: '1px solid #e1dfdd',
  },
  userAvatar: {
    width: '48px',
    height: '48px',
    borderRadius: '50%',
    backgroundColor: '#B5316A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '20px',
    fontWeight: '600',
  },
  userDetails: {
    textAlign: 'left',
  },
  userName: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 4px 0',
  },
  userRole: {
    fontSize: '14px',
    color: '#605e5c',
    margin: '0',
  },
});

const Dashboard = ({
  user,
  onLogout,
  onProfileClick,
  currentPastorate,
  userPastorates,
  onPastorateChange,
  onCreatePastorate,
  onEditPastorate,
  onDeletePastorate,
  currentChurch,
  userChurches,
  onChurchChange,
  onCreateChurch,
  onEditChurch,
  onDeleteChurch
}) => {
  const styles = useStyles();
  const [userImageUrl, setUserImageUrl] = useState(null);

  // Load user image when user or user.image changes
  useEffect(() => {
    const loadUserImage = async () => {
      if (user?.image) {
        try {
          if (user.image.startsWith('http') || user.image.startsWith('data:')) {
            setUserImageUrl(user.image);
          } else {
            // Get the local file path
            const result = await window.electron.file.getImagePath(user.image);
            if (result.success) {
              setUserImageUrl(result.url);
            } else {
              setUserImageUrl(null);
            }
          }
        } catch (error) {
          console.error('Error loading user image:', error);
          setUserImageUrl(null);
        }
      } else {
        setUserImageUrl(null);
      }
    };

    loadUserImage();
  }, [user?.image]);

  // Get user avatar letter
  const getAvatarLetter = () => {
    if (user?.name) {
      return user.name.charAt(0).toUpperCase();
    } else if (user?.username) {
      return user.username.charAt(0).toUpperCase();
    }
    return 'U';
  };

  // Get display name
  const getDisplayName = () => {
    if (user?.name) {
      return user.name;
    } else if (user?.username) {
      return user.username;
    }
    return 'User';
  };

  return (
    <div className={styles.container}>
      <div className={styles.main}>
        <div className={styles.welcomeContainer}>
          <h1 className={styles.welcomeTitle}>Welcome to Ecclesia</h1>
          <h2 className={styles.welcomeSubtitle}>Your Church Management System</h2>
          <p className={styles.welcomeMessage}>
            Manage your congregation with modern tools and insights.
            Access member information, track attendance, organize events,
            and strengthen your church community all in one place.
          </p>
          <div className={styles.userInfo}>
            <div className={styles.userAvatar}>
              {userImageUrl ? (
                <img
                  src={userImageUrl}
                  alt="Profile"
                  style={{
                    width: '100%',
                    height: '100%',
                    borderRadius: '50%',
                    objectFit: 'cover'
                  }}
                  onError={() => setUserImageUrl(null)}
                />
              ) : (
                getAvatarLetter()
              )}
            </div>
            <div className={styles.userDetails}>
              <div className={styles.userName}>Welcome, {getDisplayName()}!</div>
              <div className={styles.userRole}>
                {user?.username === 'admin' ? 'Administrator' : 'Church Member'}
              </div>
            </div>
          </div>
        </div>
      </div>
      <StatusBar
        user={user}
        onLogout={onLogout}
        onProfileClick={onProfileClick}
        currentPastorate={currentPastorate}
        userPastorates={userPastorates}
        onPastorateChange={onPastorateChange}
        onCreatePastorate={onCreatePastorate}
        onEditPastorate={onEditPastorate}
        onDeletePastorate={onDeletePastorate}
        currentChurch={currentChurch}
        userChurches={userChurches}
        onChurchChange={onChurchChange}
        onCreateChurch={onCreateChurch}
        onEditChurch={onEditChurch}
        onDeleteChurch={onDeleteChurch}
      />
    </div>
  );
};

export default Dashboard;