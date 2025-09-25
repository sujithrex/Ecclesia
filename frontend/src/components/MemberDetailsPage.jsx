import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { makeStyles } from '@fluentui/react-components';
import {
  HomeRegular,
  PersonRegular,
  EditRegular,
  CalendarRegular,
  PhoneRegular,
  BriefcaseRegular,
  ContactCardRegular
} from '@fluentui/react-icons';
import StatusBar from './StatusBar';
import Breadcrumb from './Breadcrumb';

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
    padding: '20px 2.5%',
    display: 'flex',
    flexDirection: 'column',
    gap: '24px',
    overflowY: 'auto',
    overflowX: 'hidden',
    minHeight: '0',
  },
  memberProfile: {
    backgroundColor: 'white',
    borderRadius: '8px',
    boxShadow: '0 2px 8px rgba(0, 0, 0, 0.1)',
    border: '1px solid #e1dfdd',
    padding: '32px',
    width: '95%',
    margin: '0 auto',
  },
  profileHeader: {
    display: 'flex',
    alignItems: 'flex-start',
    gap: '24px',
    marginBottom: '32px',
    paddingBottom: '24px',
    borderBottom: '2px solid #e1dfdd',
  },
  memberImage: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    objectFit: 'cover',
    border: '4px solid #B5316A',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  placeholderImage: {
    width: '150px',
    height: '150px',
    borderRadius: '50%',
    backgroundColor: '#B5316A',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: 'white',
    fontSize: '48px',
    fontWeight: '600',
    border: '4px solid #B5316A',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.15)',
  },
  profileInfo: {
    flex: 1,
  },
  memberName: {
    fontSize: '32px',
    fontWeight: '600',
    color: '#323130',
    margin: '0 0 8px 0',
  },
  memberTitle: {
    fontSize: '18px',
    color: '#605e5c',
    margin: '0 0 16px 0',
  },
  quickInfo: {
    display: 'flex',
    gap: '24px',
    flexWrap: 'wrap',
    marginBottom: '16px',
  },
  quickInfoItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    color: '#605e5c',
    fontSize: '14px',
  },
  quickInfoIcon: {
    fontSize: '16px',
  },
  editButton: {
    backgroundColor: '#B5316A',
    color: 'white',
    border: 'none',
    borderRadius: '6px',
    padding: '12px 20px',
    fontSize: '14px',
    fontWeight: '600',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    transition: 'background-color 0.2s ease',
    '&:hover': {
      backgroundColor: '#A12B5E',
    },
  },
  statusBadges: {
    display: 'flex',
    gap: '8px',
    flexWrap: 'wrap',
    marginTop: '16px',
  },
  statusBadge: {
    padding: '6px 12px',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
  },
  aliveBadge: {
    backgroundColor: '#d4edda',
    color: '#155724',
  },
  deceasedBadge: {
    backgroundColor: '#f8d7da',
    color: '#721c24',
  },
  marriedBadge: {
    backgroundColor: '#fff3cd',
    color: '#856404',
  },
  baptisedBadge: {
    backgroundColor: '#cce5ff',
    color: '#004085',
  },
  confirmedBadge: {
    backgroundColor: '#e2e3e5',
    color: '#383d41',
  },
  detailsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(3, 1fr)',
    gap: '24px',
    '@media (max-width: 1024px)': {
      gridTemplateColumns: 'repeat(2, 1fr)',
    },
    '@media (max-width: 768px)': {
      gridTemplateColumns: '1fr',
    },
  },
  detailSection: {
    backgroundColor: '#fafafa',
    borderRadius: '8px',
    padding: '20px',
    border: '1px solid #e1dfdd',
  },
  sectionTitle: {
    fontSize: '18px',
    fontWeight: '600',
    color: '#323130',
    marginBottom: '16px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  sectionIcon: {
    fontSize: '20px',
    color: '#B5316A',
  },
  detailRow: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
    marginBottom: '12px',
  },
  detailLabel: {
    fontSize: '12px',
    fontWeight: '600',
    color: '#605e5c',
    textTransform: 'uppercase',
    letterSpacing: '0.5px',
  },
  detailValue: {
    fontSize: '14px',
    color: '#323130',
    fontWeight: '500',
  },
  emptyValue: {
    color: '#8a8886',
    fontStyle: 'italic',
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

const MemberDetailsPage = ({
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
  const { areaId, familyId, memberId } = useParams();

  // State
  const [currentArea, setCurrentArea] = useState(null);
  const [currentFamily, setCurrentFamily] = useState(null);
  const [member, setMember] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [memberImageUrl, setMemberImageUrl] = useState(null);

  // Load member data
  useEffect(() => {
    if (areaId && familyId && memberId && user) {
      loadMemberDetails();
    }
  }, [areaId, familyId, memberId, user?.id]);

  // Load member image
  useEffect(() => {
    const loadMemberImage = async () => {
      if (member?.image) {
        try {
          if (member.image.startsWith('http') || member.image.startsWith('data:')) {
            setMemberImageUrl(member.image);
          } else {
            // Get the local file path
            const result = await window.electron.file.getImagePath(member.image);
            if (result.success) {
              setMemberImageUrl(result.url);
            } else {
              setMemberImageUrl(null);
            }
          }
        } catch (error) {
          console.error('Error loading member image:', error);
          setMemberImageUrl(null);
        }
      } else {
        setMemberImageUrl(null);
      }
    };

    loadMemberImage();
  }, [member?.image]);

  const loadMemberDetails = async () => {
    setLoading(true);
    setError(null);

    try {
      // Load areas to get current area
      const areasResult = await window.electron.area.getByChurch({
        churchId: currentChurch.id,
        userId: user.id
      });

      if (areasResult.success) {
        const area = areasResult.areas.find(a => a.id === parseInt(areaId));
        if (area) {
          setCurrentArea(area);
          
          // Load families to get current family
          const familiesResult = await window.electron.family.getByArea({
            areaId: area.id,
            userId: user.id
          });
          
          if (familiesResult.success) {
            const family = familiesResult.families.find(f => f.id === parseInt(familyId));
            if (family) {
              setCurrentFamily(family);
              
              // Load member details
              const memberResult = await window.electron.member.getById({
                memberId: parseInt(memberId),
                userId: user.id
              });
              
              if (memberResult.success) {
                setMember(memberResult.member);
              } else {
                setError('Member not found');
              }
            } else {
              setError('Family not found');
            }
          } else {
            setError('Failed to load family information');
          }
        } else {
          setError('Area not found');
        }
      } else {
        setError('Failed to load area information');
      }
    } catch (error) {
      console.error('Error loading member details:', error);
      setError('Failed to load member details');
    } finally {
      setLoading(false);
    }
  };

  const handleEditMember = () => {
    navigate(`/area/${areaId}/family/${familyId}/member/edit/${memberId}`, {
      state: { memberData: member }
    });
  };

  const handleBackToDashboard = () => {
    navigate('/church-dashboard');
  };

  const handleBackToArea = () => {
    navigate(`/area/${areaId}`);
  };

  const handleBackToFamily = () => {
    navigate(`/area/${areaId}/family/${familyId}`);
  };

  const formatMemberName = (member) => {
    if (!member) return '';
    const respect = member.respect.charAt(0).toUpperCase() + member.respect.slice(1);
    return `${respect}. ${member.name}`;
  };

  const formatFamilyName = (family) => {
    if (!family) return '';
    const respect = family.respect.charAt(0).toUpperCase() + family.respect.slice(1);
    return `${respect}. ${family.family_name}`;
  };

  const getAvatarLetter = () => {
    if (member?.name) {
      return member.name.charAt(0).toUpperCase();
    }
    return 'M';
  };

  const formatDate = (dateString) => {
    if (!dateString) return '-';
    try {
      return new Date(dateString).toLocaleDateString('en-IN');
    } catch (error) {
      return dateString;
    }
  };

  if (loading) {
    return (
      <div className={styles.container}>
        <div className={styles.loadingContainer}>
          <div>Loading member details...</div>
        </div>
      </div>
    );
  }

  if (error || !member) {
    return (
      <div className={styles.container}>
        <div className={styles.errorContainer}>
          <div>
            <div style={{ fontSize: '18px', marginBottom: '8px' }}>Error</div>
            <div>{error || 'Member not found'}</div>
            <button
              onClick={handleBackToFamily}
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
              Back to Family
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      {/* Breadcrumb Navigation */}
      <Breadcrumb
        pageTitle={`${formatMemberName(member)} - Member Details`}
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
            label: currentArea?.area_name || 'Area',
            onClick: handleBackToArea
          },
          {
            label: formatFamilyName(currentFamily) || 'Family',
            onClick: handleBackToFamily
          },
          {
            label: formatMemberName(member),
            current: true
          }
        ]}
        onNavigate={(path) => navigate(path)}
      />

      {/* Content */}
      <div className={styles.content}>
        <div className={styles.memberProfile}>
          {/* Profile Header */}
          <div className={styles.profileHeader}>
            <div>
              {memberImageUrl ? (
                <img
                  src={memberImageUrl}
                  alt={member.name}
                  className={styles.memberImage}
                  onError={() => setMemberImageUrl(null)}
                />
              ) : (
                <div className={styles.placeholderImage}>
                  {getAvatarLetter()}
                </div>
              )}
            </div>
            <div className={styles.profileInfo}>
              <h1 className={styles.memberName}>{formatMemberName(member)}</h1>
              <div className={styles.memberTitle}>
                {member.relation} • Member #{member.member_number} • {member.member_id}
              </div>
              
              <div className={styles.quickInfo}>
                {member.age && (
                  <div className={styles.quickInfoItem}>
                    <CalendarRegular className={styles.quickInfoIcon} />
                    {member.age} years old
                  </div>
                )}
                {member.mobile && (
                  <div className={styles.quickInfoItem}>
                    <PhoneRegular className={styles.quickInfoIcon} />
                    {member.mobile}
                  </div>
                )}
                {member.occupation && (
                  <div className={styles.quickInfoItem}>
                    <BriefcaseRegular className={styles.quickInfoIcon} />
                    {member.occupation}
                  </div>
                )}
              </div>

              <div className={styles.statusBadges}>
                <div className={member.is_alive === 'alive' ? styles.aliveBadge : styles.deceasedBadge}>
                  {member.is_alive === 'alive' ? '● Alive' : '● Deceased'}
                </div>
                {member.is_married === 'yes' && (
                  <div className={styles.marriedBadge}>
                    💍 Married
                  </div>
                )}
                {member.is_baptised === 'yes' && (
                  <div className={styles.baptisedBadge}>
                    💧 Baptised
                  </div>
                )}
                {member.is_confirmed === 'yes' && (
                  <div className={styles.confirmedBadge}>
                    ✓ Confirmed
                  </div>
                )}
              </div>

              <button
                onClick={handleEditMember}
                className={styles.editButton}
              >
                <EditRegular />
                Edit Member
              </button>
            </div>
          </div>

          {/* Details Grid */}
          <div className={styles.detailsGrid}>
            {/* Personal Information */}
            <div className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>
                <PersonRegular className={styles.sectionIcon} />
                Personal Information
              </h3>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Full Name</div>
                <div className={styles.detailValue}>{member.name}</div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Sex</div>
                <div className={styles.detailValue}>
                  {member.sex.charAt(0).toUpperCase() + member.sex.slice(1)}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Date of Birth</div>
                <div className={styles.detailValue}>
                  {formatDate(member.dob)}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Age</div>
                <div className={styles.detailValue}>
                  {member.age ? `${member.age} years` : '-'}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Aadhar Number</div>
                <div className={styles.detailValue}>
                  {member.aadhar_number || <span className={styles.emptyValue}>Not provided</span>}
                </div>
              </div>
            </div>

            {/* Contact Information */}
            <div className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>
                <ContactCardRegular className={styles.sectionIcon} />
                Contact Information
              </h3>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Mobile Number</div>
                <div className={styles.detailValue}>
                  {member.mobile || <span className={styles.emptyValue}>Not provided</span>}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Family</div>
                <div className={styles.detailValue}>
                  {formatFamilyName(currentFamily)}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Relation</div>
                <div className={styles.detailValue}>{member.relation}</div>
              </div>
            </div>

            {/* Professional Information */}
            <div className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>
                <BriefcaseRegular className={styles.sectionIcon} />
                Professional Information
              </h3>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Occupation</div>
                <div className={styles.detailValue}>
                  {member.occupation || <span className={styles.emptyValue}>Not specified</span>}
                </div>
              </div>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Working Place</div>
                <div className={styles.detailValue}>
                  {member.working_place || <span className={styles.emptyValue}>Not specified</span>}
                </div>
              </div>
            </div>

            {/* Religious Information */}
            <div className={styles.detailSection}>
              <h3 className={styles.sectionTitle}>
                <span className={styles.sectionIcon}>✟</span>
                Religious Information
              </h3>
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Baptism Status</div>
                <div className={styles.detailValue}>
                  {member.is_baptised === 'yes' ? 'Baptised' : 'Not Baptised'}
                </div>
              </div>
              
              {member.is_baptised === 'yes' && (
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Date of Baptism</div>
                  <div className={styles.detailValue}>
                    {formatDate(member.date_of_baptism)}
                  </div>
                </div>
              )}
              
              <div className={styles.detailRow}>
                <div className={styles.detailLabel}>Confirmation Status</div>
                <div className={styles.detailValue}>
                  {member.is_confirmed === 'yes' ? 'Confirmed' : 'Not Confirmed'}
                </div>
              </div>
              
              {member.is_confirmed === 'yes' && (
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Date of Confirmation</div>
                  <div className={styles.detailValue}>
                    {formatDate(member.date_of_confirmation)}
                  </div>
                </div>
              )}
            </div>

            {/* Marriage Information */}
            {member.is_married === 'yes' && (
              <div className={styles.detailSection}>
                <h3 className={styles.sectionTitle}>
                  <span className={styles.sectionIcon}>💍</span>
                  Marriage Information
                </h3>
                
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Marriage Status</div>
                  <div className={styles.detailValue}>Married</div>
                </div>
                
                <div className={styles.detailRow}>
                  <div className={styles.detailLabel}>Date of Marriage</div>
                  <div className={styles.detailValue}>
                    {formatDate(member.date_of_marriage)}
                  </div>
                </div>
              </div>
            )}
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

export default MemberDetailsPage;