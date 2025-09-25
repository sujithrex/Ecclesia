import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  PeopleRegular,
  BuildingRegular,
  AddRegular,
  SearchRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';
import AreasDataGrid from './AreasDataGrid';
import PrayerCellsDataGrid from './PrayerCellsDataGrid';
import CreateAreaModal from './CreateAreaModal';
import CreatePrayerCellModal from './CreatePrayerCellModal';

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
  mainLayout: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px',
  },
  gridSection: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    display: 'flex',
    flexDirection: 'column',
  },
  gridHeader: {
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
    width: '200px',
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
  gridTitle: {
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
  gridContent: {
    display: 'flex',
    flexDirection: 'column',
  }
});

const ChurchDashboard = ({
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
  onDeleteChurch,
  currentView = "church",
  onPastorateDashboard
}) => {
  const styles = useStyles();
  const navigate = useNavigate();
  const [showCreateAreaModal, setShowCreateAreaModal] = useState(false);
  const [showCreatePrayerCellModal, setShowCreatePrayerCellModal] = useState(false);
  const [areas, setAreas] = useState([]);
  const [prayerCells, setPrayerCells] = useState([]);
  const [editingArea, setEditingArea] = useState(null);
  const [editingPrayerCell, setEditingPrayerCell] = useState(null);
  const [areasSearchTerm, setAreasSearchTerm] = useState('');
  const [prayerCellsSearchTerm, setPrayerCellsSearchTerm] = useState('');
  const [loading, setLoading] = useState(true);
  const [statistics, setStatistics] = useState({
    baptised: 0,
    confirmed: 0,
    families: 0,
    christians: 0
  });
  const [statsLoading, setStatsLoading] = useState(true);

  // Build stats array from dynamic data
  const stats = [
    {
      icon: <PeopleRegular />,
      label: 'ஞானஸ்நானகாரர்கள்',
      value: statistics.baptised,
    },
    {
      icon: <PeopleRegular />,
      label: 'நற்கருணைதாரர்கள்',
      value: statistics.confirmed,
    },
    {
      icon: <HomeRegular />,
      label: 'குடும்பங்கள்',
      value: statistics.families,
    },
    {
      icon: <PeopleRegular />,
      label: 'கிறிஸ்தவர்கள்',
      value: statistics.christians,
    },
  ];

  // Load statistics when church changes
  useEffect(() => {
    if (currentChurch && user) {
      loadStatistics();
    }
  }, [currentChurch?.id, user?.id]);

  // Load areas and prayer cells when church changes
  useEffect(() => {
    if (currentChurch && user) {
      loadAreasAndPrayerCells();
    }
  }, [currentChurch?.id, user?.id]);

  const loadStatistics = async () => {
    if (!currentChurch || !user) return;
    
    setStatsLoading(true);
    try {
      const result = await window.electron.church.getStatistics({
        churchId: currentChurch.id,
        userId: user.id
      });
      
      if (result.success) {
        setStatistics(result.statistics);
      } else {
        console.error('Failed to load statistics:', result.error);
        setStatistics({
          baptised: 0,
          confirmed: 0,
          families: 0,
          christians: 0
        });
      }
    } catch (error) {
      console.error('Error loading statistics:', error);
      setStatistics({
        baptised: 0,
        confirmed: 0,
        families: 0,
        christians: 0
      });
    } finally {
      setStatsLoading(false);
    }
  };

  const loadAreasAndPrayerCells = async () => {
    if (!currentChurch || !user) return;
    
    setLoading(true);
    try {
      // Load areas
      const areasResult = await window.electron.area.getByChurch({
        churchId: currentChurch.id,
        userId: user.id
      });
      
      if (areasResult.success) {
        setAreas(areasResult.areas || []);
      } else {
        console.error('Failed to load areas:', areasResult.error);
        setAreas([]);
      }

      // Load prayer cells
      const prayerCellsResult = await window.electron.prayerCell.getByChurch({
        churchId: currentChurch.id,
        userId: user.id
      });
      
      if (prayerCellsResult.success) {
        setPrayerCells(prayerCellsResult.prayerCells || []);
      } else {
        console.error('Failed to load prayer cells:', prayerCellsResult.error);
        setPrayerCells([]);
      }
    } catch (error) {
      console.error('Error loading data:', error);
      setAreas([]);
      setPrayerCells([]);
    } finally {
      setLoading(false);
    }
  };

  const handleCreateArea = () => {
    setEditingArea(null);
    setShowCreateAreaModal(true);
  };

  const handleEditArea = (area) => {
    setEditingArea(area);
    setShowCreateAreaModal(true);
  };

  const handleAreaCreated = (area) => {
    if (editingArea) {
      setAreas(prev => prev.map(a => a.id === area.id ? area : a));
    } else {
      setAreas(prev => [...prev, area]);
    }
    setShowCreateAreaModal(false);
    setEditingArea(null);
    // Refresh statistics as areas might affect family/member counts
    loadStatistics();
  };

  const handleAreaDeleted = (areaId) => {
    setAreas(prev => prev.filter(a => a.id !== areaId));
    // Refresh statistics as deleting area affects family/member counts
    loadStatistics();
  };

  const handleCreatePrayerCell = () => {
    setEditingPrayerCell(null);
    setShowCreatePrayerCellModal(true);
  };

  const handleEditPrayerCell = (prayerCell) => {
    setEditingPrayerCell(prayerCell);
    setShowCreatePrayerCellModal(true);
  };

  const handlePrayerCellCreated = (prayerCell) => {
    if (editingPrayerCell) {
      setPrayerCells(prev => prev.map(p => p.id === prayerCell.id ? prayerCell : p));
    } else {
      setPrayerCells(prev => [...prev, prayerCell]);
    }
    setShowCreatePrayerCellModal(false);
    setEditingPrayerCell(null);
  };

  const handlePrayerCellDeleted = (prayerCellId) => {
    setPrayerCells(prev => prev.filter(p => p.id !== prayerCellId));
  };

  if (!currentChurch || !currentPastorate) {
    return null;
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`${currentPastorate.pastorate_short_name} - ${currentChurch.church_name}`}
        breadcrumbs={[
          {
            label: 'Dashboard',
            icon: <HomeRegular />,
            onClick: () => navigate('/dashboard')
          },
          {
            label: `${currentPastorate.pastorate_short_name} - ${currentChurch.church_name}`,
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
                {statsLoading ? '...' : stat.value.toLocaleString()}
              </div>
            </div>
          ))}
        </div>

        {/* Two-Column Layout for Data Grids */}
        <div className={styles.mainLayout}>
          {/* Areas Section */}
          <div className={styles.gridSection}>
            <div className={styles.gridHeader}>
              <h2 className={styles.gridTitle}>Areas</h2>
              <div className={styles.searchInputContainer}>
                <SearchRegular className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search areas..."
                  value={areasSearchTerm}
                  onChange={(e) => setAreasSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button
                className={styles.createButton}
                onClick={handleCreateArea}
                type="button"
              >
                <AddRegular />
                Create Area
              </button>
            </div>
            <div className={styles.gridContent}>
              <AreasDataGrid
                areas={areas}
                onEdit={handleEditArea}
                onDelete={handleAreaDeleted}
                user={user}
                currentChurch={currentChurch}
                searchTerm={areasSearchTerm}
              />
            </div>
          </div>

          {/* Prayer Cells Section */}
          <div className={styles.gridSection}>
            <div className={styles.gridHeader}>
              <h2 className={styles.gridTitle}>Prayer Cells</h2>
              <div className={styles.searchInputContainer}>
                <SearchRegular className={styles.searchIcon} />
                <input
                  type="text"
                  placeholder="Search prayer cells..."
                  value={prayerCellsSearchTerm}
                  onChange={(e) => setPrayerCellsSearchTerm(e.target.value)}
                  className={styles.searchInput}
                />
              </div>
              <button
                className={styles.createButton}
                onClick={handleCreatePrayerCell}
                type="button"
              >
                <AddRegular />
                Create Prayer Cell
              </button>
            </div>
            <div className={styles.gridContent}>
              <PrayerCellsDataGrid
                prayerCells={prayerCells}
                onEdit={handleEditPrayerCell}
                onDelete={handlePrayerCellDeleted}
                user={user}
                currentChurch={currentChurch}
                searchTerm={prayerCellsSearchTerm}
              />
            </div>
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
        currentView={currentView}
        onPastorateDashboard={onPastorateDashboard}
      />

      {/* Modals */}
      <CreateAreaModal
        isOpen={showCreateAreaModal}
        onClose={() => {
          setShowCreateAreaModal(false);
          setEditingArea(null);
        }}
        onSuccess={handleAreaCreated}
        user={user}
        currentChurch={currentChurch}
        editMode={!!editingArea}
        initialData={editingArea}
      />

      <CreatePrayerCellModal
        isOpen={showCreatePrayerCellModal}
        onClose={() => {
          setShowCreatePrayerCellModal(false);
          setEditingPrayerCell(null);
        }}
        onSuccess={handlePrayerCellCreated}
        user={user}
        currentChurch={currentChurch}
        editMode={!!editingPrayerCell}
        initialData={editingPrayerCell}
      />
    </div>
  );
};

export default ChurchDashboard;