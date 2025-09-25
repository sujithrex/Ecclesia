import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  PeopleRegular,
  AddRegular,
  SearchRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';
import FamiliesDataGrid from './FamiliesDataGrid';

const useStyles = makeStyles({
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: 'calc(100vh - 32px)',
    backgroundColor: '#f8f8f8',
    fontFamily: 'Segoe UI, -apple-system, BlinkMacSystemFont, Roboto, sans-serif',
    overflow: 'hidden',
  },
  content: {
    flex: 1,
    padding: '20px 40px',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: '0',
  },
  statsContainer: {
    display: 'grid',
    gridTemplateColumns: 'repeat(4, 1fr)',
    gap: '20px',
    marginBottom: '24px',
  },
  statCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '24px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    gap: '12px',
    transition: 'transform 0.2s ease, box-shadow 0.2s ease',
    '&:hover': {
      transform: 'translateY(-2px)',
      boxShadow: '0 4px 16px rgba(0, 0, 0, 0.15)',
    }
  },
  statIcon: {
    fontSize: '32px',
    color: '#B5316A',
  },
  statLabel: {
    fontSize: '16px',
    fontWeight: '600',
    color: '#323130',
    textAlign: 'center',
    fontFamily: 'Pavanam, Segoe UI, sans-serif',
    lineHeight: '1.4',
  },
  statValue: {
    fontSize: '28px',
    fontWeight: '700',
    color: '#B5316A',
  },
  familiesSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  familiesHeader: {
    padding: '20px 24px',
    borderBottom: '1px solid #e1dfdd',
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#fafafa',
    gap: '16px',
  },
  searchInputContainer: {
    position: 'relative',
    width: '250px',
  },
  searchInput: {
    width: '100%',
    padding: '8px 12px 8px 32px',
    border: '1px solid #8a8886',
    borderRadius: '4px',
    fontSize: '14px',
    backgroundColor: 'white',
    '&:focus': {
      outline: 'none',
      borderColor: '#B5316A',
      boxShadow: '0 0 0 2px rgba(181, 49, 106, 0.2)',
    },
  },
  searchIcon: {
    position: 'absolute',
    left: '8px',
    top: '50%',
    transform: 'translateY(-50%)',
    color: '#605e5c',
    fontSize: '16px',
  },
  familiesTitle: {
    fontSize: '20px',
    fontWeight: '600',
    color: '#323130',
    margin: '0',
  },
  createButton: {
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
  },
  familiesContent: {
    display: 'flex',
    flexDirection: 'column',
    flex: 1,
  },
  loadingContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    color: '#605e5c',
  },
  errorContainer: {
    display: 'flex',
    justifyContent: 'center',
    alignItems: 'center',
    padding: '40px',
    color: '#d13438',
    textAlign: 'center',
  }
});

const AreaPage = ({
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
  const navigate = useNavigate();
  const { areaId } = useParams();

  // State
  const [currentArea, setCurrentArea] = useState(null);
  const [families, setFamilies] = useState([]);
  const [familiesSearchTerm, setFamiliesSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  // Load area and families data
  useEffect(() => {
    if (areaId && user) {
      loadAreaAndFamilies();
    }
  }, [areaId, user?.id]);

  const loadAreaAndFamilies = async () => {
    if (!areaId || !user) return;
    
    setLoading(true);
    setError(null);

    try {
      // First, we need to get the area info
      // Since we don't have a direct getAreaById endpoint, we'll need to get it through church areas
      if (!currentChurch) {
        setError('No church selected');
        setLoading(false);
        return;
      }

      // Load areas from current church to find the specific area
      const areasResult = await window.electron.area.getByChurch({
        churchId: currentChurch.id,
        userId: user.id
      });

      if (areasResult.success) {
        const area = areasResult.areas.find(a => a.id === parseInt(areaId));
        if (area) {
          setCurrentArea(area);
          
          // Load families for this area
          const familiesResult = await window.electron.family.getByArea({
            areaId: area.id,
            userId: user.id
          });
          
          if (familiesResult.success) {
            setFamilies(familiesResult.families || []);
          } else {
            console.error('Failed to load families:', familiesResult.error);
            setFamilies([]);
          }
        } else {
          setError('Area not found');
        }
      } else {
        console.error('Failed to load areas:', areasResult.error);
        setError('Failed to load area information');
      }
    } catch (error) {
      console.error('Error loading area data:', error);
      setError('Failed to load area data');
    } finally {
      setLoading(false);
    }
  };

  const handleCreateFamily = () => {
    navigate(`/area/${areaId}/family/create`);
  };

  const handleEditFamily = (family) => {
    navigate(`/area/${areaId}/family/edit/${family.id}`, {
      state: { familyData: family }
    });
  };

  const handleFamilyUpdated = (family) => {
    setFamilies(prev => prev.map(f => f.id === family.id ? family : f));
  };

  const handleFamilyDeleted = (familyId) => {
    setFamilies(prev => prev.filter(f => f.id !== familyId));
  };

  const handleBackToDashboard = () => {
    navigate('/dashboard');
  };

  // Statistics - calculate from families data
  const stats = [
    {
      icon: <PeopleRegular />,
      label: 'Total Families',
      value: families.length,
    },
    {
      icon: <PeopleRegular />,
      label: 'With Prayer Cell',
      value: families.filter(f => f.prayer_cell_id).length,
    },
    {
      icon: <PeopleRegular />,
      label: 'With Phone',
      value: families.filter(f => f.family_phone).length,
    },
    {
      icon: <PeopleRegular />,
      label: 'With Email',
      value: families.filter(f => f.family_email).length,
    },
  ];

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div>Loading area information...</div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Error</div>
            <div>{error}</div>
            <button
              onClick={handleBackToDashboard}
              style={{
                marginTop: '16px',
                padding: '8px 16px',
                backgroundColor: '#B5316A',
                color: 'white',
                border: 'none',
                borderRadius: '4px',
                cursor: 'pointer'
              }}
            >
              Back to Dashboard
            </button>
          </div>
        </div>
      </div>
    );
  }

  if (!currentArea) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div>Area not found</div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={currentPastorate && currentChurch
          ? `${currentPastorate.pastorate_short_name} - ${currentChurch.church_name} - ${currentArea.area_name}`
          : currentArea.area_name}
        breadcrumbs={[
          {
            label: 'Dashboard',
            icon: <HomeRegular />,
            onClick: handleBackToDashboard
          },
          {
            label: currentPastorate?.pastorate_short_name || 'Pastorate',
            onClick: handleBackToDashboard
          },
          {
            label: currentChurch?.church_name || 'Church',
            onClick: handleBackToDashboard
          },
          {
            label: currentArea.area_name,
            current: true
          }
        ]}
        onNavigate={(path) => navigate(path)}
      />

      {/* Content */}
      <div className={styles.content}>
        {/* Statistics Cards */}
        <div className={styles.statsContainer}>
          {stats.map((stat, index) => (
            <div key={index} className={styles.statCard}>
              <div className={styles.statIcon}>
                {stat.icon}
              </div>
              <div className={styles.statLabel}>
                {stat.label}
              </div>
              <div className={styles.statValue}>
                {stat.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Families Section */}
        <div className={styles.familiesSection}>
          <div className={styles.familiesHeader}>
            <h2 className={styles.familiesTitle}>Families in {currentArea.area_name}</h2>
            <div className={styles.searchInputContainer}>
              <SearchRegular className={styles.searchIcon} />
              <input
                type="text"
                placeholder="Search families..."
                value={familiesSearchTerm}
                onChange={(e) => setFamiliesSearchTerm(e.target.value)}
                className={styles.searchInput}
              />
            </div>
            <button
              className={styles.createButton}
              onClick={handleCreateFamily}
              type="button"
            >
              <AddRegular />
              Create Family
            </button>
          </div>
          <div className={styles.familiesContent}>
            <FamiliesDataGrid
              families={families}
              onEdit={handleEditFamily}
              onDelete={handleFamilyDeleted}
              user={user}
              currentArea={currentArea}
              searchTerm={familiesSearchTerm}
            />
          </div>
        </div>
      </div>

      {/* Status Bar */}
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
        disablePastorateChurchChange={true}
      />
    </div>
  );
};

export default AreaPage;