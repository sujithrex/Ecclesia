class MemberService {
    constructor(dbManager) {
        this.db = dbManager;
    }

    async createMember(familyId, memberData, userId) {
        try {
            // Validate required fields
            const { respect, name, relation, sex } = memberData;
            
            if (!respect || !name || !relation || !sex) {
                return { success: false, error: 'Respect, name, relation, and sex are required' };
            }

            if (!familyId) {
                return { success: false, error: 'Family ID is required' };
            }

            // Validate respect field
            const validRespects = ['mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop'];
            if (!validRespects.includes(respect.toLowerCase())) {
                return { success: false, error: 'Invalid respect value' };
            }

            // Validate sex field
            const validSex = ['male', 'female'];
            if (!validSex.includes(sex.toLowerCase())) {
                return { success: false, error: 'Sex must be either male or female' };
            }

            // Get family info and verify user access
            const family = await this.db.getFamilyById(familyId);
            if (!family) {
                return { success: false, error: 'Family not found' };
            }

            // Get area info to verify church access
            const area = await this.db.getAreaById(family.area_id);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this family
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this family' };
            }

            // Generate auto-numbers and ID if not provided
            let { member_number, member_id } = memberData;
            
            if (!member_number) {
                member_number = await this.db.getNextMemberNumber(familyId);
            } else {
                // Validate 2-digit format if provided
                if (!/^\d{2}$/.test(member_number)) {
                    return { success: false, error: 'Member number must be a 2-digit number' };
                }
                // Check for duplicate member number in the same family
                const existingMember = await this.db.getMemberByFamilyAndNumber(familyId, member_number);
                if (existingMember) {
                    return { success: false, error: 'A member with this number already exists in this family' };
                }
            }
            
            if (!member_id) {
                member_id = await this.db.getNextMemberId();
            }

            // Calculate age from DOB if provided
            let age = null;
            if (memberData.dob) {
                const birthDate = new Date(memberData.dob);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }

            // Create the member
            const result = await this.db.createMember(familyId, {
                ...memberData,
                member_id,
                member_number,
                respect: respect.toLowerCase(),
                sex: sex.toLowerCase(),
                age
            });
            
            if (result.success) {
                const memberId = result.id;
                
                // Handle spouse synchronization if spouse is selected
                if (memberData.spouse_id && memberData.is_married === 'yes') {
                    await this.syncSpouseConnection(memberId, memberData.spouse_id, memberData.date_of_marriage);
                }
                
                // Return the created member details
                const member = await this.db.getMemberById(memberId);
                return {
                    success: true,
                    message: 'Member created successfully',
                    member: member
                };
            } else {
                return { success: false, error: result.error || 'Failed to create member' };
            }
        } catch (error) {
            console.error('Create member error:', error);
            return { success: false, error: 'Failed to create member' };
        }
    }

    async getMembersByFamily(familyId, userId) {
        try {
            // Get family info and verify user access
            const family = await this.db.getFamilyById(familyId);
            if (!family) {
                return { success: false, error: 'Family not found' };
            }

            // Get area info to verify church access
            const area = await this.db.getAreaById(family.area_id);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this family
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this family' };
            }

            const members = await this.db.getMembersByFamily(familyId);
            return {
                success: true,
                members: members
            };
        } catch (error) {
            console.error('Get members by family error:', error);
            return { success: false, error: 'Failed to get members' };
        }
    }

    async getMemberById(memberId, userId) {
        try {
            const member = await this.db.getMemberById(memberId);
            if (!member) {
                return { success: false, error: 'Member not found' };
            }

            // Get family info and verify user access
            const family = await this.db.getFamilyById(member.family_id);
            if (!family) {
                return { success: false, error: 'Family not found' };
            }

            // Get area info to verify church access
            const area = await this.db.getAreaById(family.area_id);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this family
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this member' };
            }

            return {
                success: true,
                member: member
            };
        } catch (error) {
            console.error('Get member by ID error:', error);
            return { success: false, error: 'Failed to get member' };
        }
    }

    async updateMember(memberId, memberData, userId) {
        try {
            // Validate required fields
            const { member_number, respect, name, relation, sex } = memberData;
            
            if (!member_number || !respect || !name || !relation || !sex) {
                return { success: false, error: 'Member number, respect, name, relation, and sex are required' };
            }

            // Validate 2-digit number format for member_number
            if (!/^\d{2}$/.test(member_number)) {
                return { success: false, error: 'Member number must be a 2-digit number' };
            }

            // Validate respect field
            const validRespects = ['mr', 'mrs', 'ms', 'master', 'rev', 'dr', 'er', 'sis', 'bishop'];
            if (!validRespects.includes(respect.toLowerCase())) {
                return { success: false, error: 'Invalid respect value' };
            }

            // Validate sex field
            const validSex = ['male', 'female'];
            if (!validSex.includes(sex.toLowerCase())) {
                return { success: false, error: 'Sex must be either male or female' };
            }

            // Get the member to find its family
            const member = await this.db.getMemberById(memberId);
            if (!member) {
                return { success: false, error: 'Member not found' };
            }

            // Get family info and verify user access
            const family = await this.db.getFamilyById(member.family_id);
            if (!family) {
                return { success: false, error: 'Family not found' };
            }

            // Get area info to verify church access
            const area = await this.db.getAreaById(family.area_id);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this family
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this member' };
            }

            // Check for duplicate member number in the same family (excluding current member)
            const existingMember = await this.db.getMemberByFamilyAndNumber(member.family_id, member_number);
            if (existingMember && existingMember.id !== memberId) {
                return { success: false, error: 'A member with this number already exists in this family' };
            }

            // Calculate age from DOB if provided
            let age = null;
            if (memberData.dob) {
                const birthDate = new Date(memberData.dob);
                const today = new Date();
                age = today.getFullYear() - birthDate.getFullYear();
                const monthDiff = today.getMonth() - birthDate.getMonth();
                if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
                    age--;
                }
            }

            // Update the member
            const result = await this.db.updateMember(memberId, {
                ...memberData,
                respect: respect.toLowerCase(),
                sex: sex.toLowerCase(),
                age
            });
            
            if (result.success) {
                // Handle spouse synchronization if spouse is selected and married
                if (memberData.spouse_id && memberData.is_married === 'yes') {
                    await this.syncSpouseConnection(memberId, memberData.spouse_id, memberData.date_of_marriage);
                } else if (memberData.is_married === 'no') {
                    // If unmarried, clear any existing spouse connections
                    await this.clearSpouseConnection(memberId);
                }
                
                // Return the updated member details
                const updatedMember = await this.db.getMemberById(memberId);
                return {
                    success: true,
                    message: 'Member updated successfully',
                    member: updatedMember
                };
            } else {
                return { success: false, error: result.error || 'Failed to update member' };
            }
        } catch (error) {
            console.error('Update member error:', error);
            return { success: false, error: 'Failed to update member' };
        }
    }

    async deleteMember(memberId, userId) {
        try {
            // Get member info before deletion for verification and confirmation
            const member = await this.db.getMemberById(memberId);
            if (!member) {
                return { success: false, error: 'Member not found' };
            }

            // Get family info and verify user access
            const family = await this.db.getFamilyById(member.family_id);
            if (!family) {
                return { success: false, error: 'Family not found' };
            }

            // Get area info to verify church access
            const area = await this.db.getAreaById(family.area_id);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this family
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this member' };
            }

            // Delete the member
            const result = await this.db.deleteMember(memberId);
            
            if (result.success) {
                return {
                    success: true,
                    message: `Member "${member.respect}. ${member.name}" deleted successfully`
                };
            } else {
                return { success: false, error: result.error || 'Failed to delete member' };
            }
        } catch (error) {
            console.error('Delete member error:', error);
            return { success: false, error: 'Failed to delete member' };
        }
    }

    async getAutoNumbers(familyId, userId) {
        try {
            // Get family info and verify user access
            const family = await this.db.getFamilyById(familyId);
            if (!family) {
                return { success: false, error: 'Family not found' };
            }

            // Get area info to verify church access
            const area = await this.db.getAreaById(family.area_id);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this family
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this family' };
            }

            const memberNumber = await this.db.getNextMemberNumber(familyId);
            const memberId = await this.db.getNextMemberId();

            return {
                success: true,
                memberNumber,
                memberId
            };
        } catch (error) {
            console.error('Get auto numbers error:', error);
            return { success: false, error: 'Failed to get auto numbers' };
        }
    }

    async getFamilyMembers(familyId, userId, excludeMemberId = null) {
        try {
            // Get family info and verify user access
            const family = await this.db.getFamilyById(familyId);
            if (!family) {
                return { success: false, error: 'Family not found' };
            }

            // Get area info to verify church access
            const area = await this.db.getAreaById(family.area_id);
            if (!area) {
                return { success: false, error: 'Area not found' };
            }

            // Verify user has access to the church that owns this family
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === area.church_id);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this family' };
            }

            let members = await this.db.getMembersByFamily(familyId);
            
            // Filter out the current member if excludeMemberId is provided
            if (excludeMemberId) {
                members = members.filter(member => member.id !== excludeMemberId);
            }

            // Filter to only alive members (potential spouses)
            members = members.filter(member => member.is_alive === 'alive');

            return {
                success: true,
                members: members
            };
        } catch (error) {
            console.error('Get family members error:', error);
            return { success: false, error: 'Failed to get family members' };
        }
    }

    async syncSpouseConnection(memberId, spouseId, marriageDate) {
        try {
            // Get both members
            const member = await this.db.getMemberById(memberId);
            const spouse = await this.db.getMemberById(spouseId);

            if (!member || !spouse) {
                throw new Error('Member or spouse not found');
            }

            // Update both members to point to each other as spouses
            await this.db.updateMember(memberId, {
                ...member,
                is_married: 'yes',
                date_of_marriage: marriageDate,
                spouse_id: spouseId
            });

            await this.db.updateMember(spouseId, {
                ...spouse,
                is_married: 'yes',
                date_of_marriage: marriageDate,
                spouse_id: memberId
            });

            return { success: true };
        } catch (error) {
            console.error('Sync spouse connection error:', error);
            return { success: false, error: 'Failed to sync spouse connection' };
        }
    }

    async clearSpouseConnection(memberId) {
        try {
            // Get the member
            const member = await this.db.getMemberById(memberId);
            if (!member) {
                throw new Error('Member not found');
            }

            // If member has a spouse, clear both connections
            if (member.spouse_id) {
                const spouse = await this.db.getMemberById(member.spouse_id);
                if (spouse) {
                    // Clear spouse's connection to this member
                    await this.db.updateMember(member.spouse_id, {
                        ...spouse,
                        is_married: 'no',
                        date_of_marriage: null,
                        spouse_id: null
                    });
                }
            }

            // Clear this member's spouse connection
            await this.db.updateMember(memberId, {
                ...member,
                is_married: 'no',
                date_of_marriage: null,
                spouse_id: null
            });

            return { success: true };
        } catch (error) {
            console.error('Clear spouse connection error:', error);
            return { success: false, error: 'Failed to clear spouse connection' };
        }
    }

    async getBirthdaysByDateRange(churchId, fromDate, toDate, userId, areaId = null) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const birthdays = await this.db.getBirthdaysByDateRange(churchId, fromDate, toDate, areaId);
            return {
                success: true,
                birthdays: birthdays
            };
        } catch (error) {
            console.error('Get birthdays by date range error:', error);
            return { success: false, error: 'Failed to get birthdays' };
        }
    }

    async getTodaysBirthdays(churchId, userId, areaId = null) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const birthdays = await this.db.getTodaysBirthdays(churchId, areaId);
            return {
                success: true,
                birthdays: birthdays
            };
        } catch (error) {
            console.error('Get today\'s birthdays error:', error);
            return { success: false, error: 'Failed to get today\'s birthdays' };
        }
    }

    async getThisWeekBirthdays(churchId, userId, areaId = null) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const birthdays = await this.db.getThisWeekBirthdays(churchId, areaId);
            return {
                success: true,
                birthdays: birthdays
            };
        } catch (error) {
            console.error('Get this week birthdays error:', error);
            return { success: false, error: 'Failed to get this week birthdays' };
        }
    }

    async getBirthdayStatistics(churchId, userId, areaId = null) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const stats = await this.db.getBirthdayStatistics(churchId, areaId);
            return {
                success: true,
                statistics: stats
            };
        } catch (error) {
            console.error('Get birthday statistics error:', error);
            return { success: false, error: 'Failed to get birthday statistics' };
        }
    }

    async getWeddingsByDateRange(churchId, fromDate, toDate, userId, areaId = null) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const weddings = await this.db.getWeddingsByDateRange(churchId, fromDate, toDate, areaId);
            return {
                success: true,
                weddings: weddings
            };
        } catch (error) {
            console.error('Get weddings by date range error:', error);
            return { success: false, error: 'Failed to get weddings' };
        }
    }

    async getTodaysWeddings(churchId, userId, areaId = null) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const weddings = await this.db.getTodaysWeddings(churchId, areaId);
            return {
                success: true,
                weddings: weddings
            };
        } catch (error) {
            console.error('Get today\'s weddings error:', error);
            return { success: false, error: 'Failed to get today\'s weddings' };
        }
    }

    async getThisWeekWeddings(churchId, userId, areaId = null) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const weddings = await this.db.getThisWeekWeddings(churchId, areaId);
            return {
                success: true,
                weddings: weddings
            };
        } catch (error) {
            console.error('Get this week weddings error:', error);
            return { success: false, error: 'Failed to get this week weddings' };
        }
    }

    async getWeddingStatistics(churchId, userId, areaId = null) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const stats = await this.db.getWeddingStatistics(churchId, areaId);
            return {
                success: true,
                statistics: stats
            };
        } catch (error) {
            console.error('Get wedding statistics error:', error);
            return { success: false, error: 'Failed to get wedding statistics' };
        }
    }

    async getBirthdayReportData(churchId, fromDate, toDate, userId, areaId = null) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);
            
            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Get church details
            const church = await this.db.getChurchById(churchId);
            if (!church) {
                return { success: false, error: 'Church not found' };
            }

            // Get pastorate details for dynamic header information
            const pastorate = await this.db.getPastorateById(church.pastorate_id);
            let pastorateSettings = null;
            let churchSettings = null;
            
            try {
                pastorateSettings = await this.db.getPastorateSettings(church.pastorate_id);
                if (!pastorateSettings) {
                    // Fallback to default pastorate settings
                    pastorateSettings = await this.db.getDefaultPastorateSettings(church.pastorate_id);
                }
            } catch (error) {
                console.warn('Could not fetch pastorate settings:', error);
            }

            try {
                churchSettings = await this.db.getChurchSettings(churchId);
                if (!churchSettings) {
                    // Fallback to default church settings
                    churchSettings = await this.db.getDefaultChurchSettings(churchId);
                }
            } catch (error) {
                console.warn('Could not fetch church settings:', error);
            }

            // Enhance church object with dynamic header information
            const enhancedChurch = {
                ...church,
                // Diocese name from pastorate settings
                diocese_name: pastorateSettings?.diocese_name_english || 'Tirunelveli Diocese',
                // Pastorate short name from pastorate table
                pastorate_short_name: pastorate?.pastorate_short_name || 'Pastorate',
                // Church name from church settings or fallback to church name
                church_display_name: churchSettings?.church_name_english || church.church_name
            };

            // Get birthday members in the date range
            const birthdayMembers = await this.db.getBirthdaysByDateRange(churchId, fromDate, toDate, areaId);
            
            // Group members by family
            const familiesWithBirthdays = {};
            for (const member of birthdayMembers) {
                if (!familiesWithBirthdays[member.family_id]) {
                    familiesWithBirthdays[member.family_id] = {
                        family: null,
                        members: [],
                        celebrants: []
                    };
                }
                familiesWithBirthdays[member.family_id].celebrants.push(member);
            }

            // For each family with birthday celebrants, get all family members and family details
            for (const familyId in familiesWithBirthdays) {
                const family = await this.db.getFamilyById(parseInt(familyId));
                if (family) {
                    const area = await this.db.getAreaById(family.area_id);
                    const fellowship = await this.db.getPrayerCellById(family.prayer_cell_id);
                    
                    // Add area and fellowship details to family
                    family.area_name = area ? area.area_name : 'N/A';
                    family.fellowship_name = fellowship ? fellowship.prayer_cell_name : 'N/A';
                    
                    familiesWithBirthdays[familyId].family = family;
                    
                    // Get all family members
                    const allFamilyMembers = await this.db.getMembersByFamily(parseInt(familyId));
                    familiesWithBirthdays[familyId].members = allFamilyMembers;
                }
            }

            // Convert to array and sort by family ID
            const reportData = Object.values(familiesWithBirthdays)
                .filter(data => data.family)
                .sort((a, b) => a.family.id - b.family.id);

            return {
                success: true,
                church: enhancedChurch,
                reportData: reportData,
                dateRange: { fromDate, toDate }
            };
        } catch (error) {
            console.error('Get birthday report data error:', error);
            return { success: false, error: 'Failed to get birthday report data' };
        }
    }

    async getWeddingReportData(churchId, fromDate, toDate, userId, areaId = null) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Get church details
            const church = await this.db.getChurchById(churchId);
            if (!church) {
                return { success: false, error: 'Church not found' };
            }

            // Get pastorate details for dynamic header information
            const pastorate = await this.db.getPastorateById(church.pastorate_id);
            let pastorateSettings = null;
            let churchSettings = null;

            try {
                pastorateSettings = await this.db.getPastorateSettings(church.pastorate_id);
                if (!pastorateSettings) {
                    pastorateSettings = await this.db.getDefaultPastorateSettings(church.pastorate_id);
                }
            } catch (error) {
                console.warn('Could not fetch pastorate settings:', error);
            }

            try {
                churchSettings = await this.db.getChurchSettings(churchId);
                if (!churchSettings) {
                    churchSettings = await this.db.getDefaultChurchSettings(churchId);
                }
            } catch (error) {
                console.warn('Could not fetch church settings:', error);
            }

            // Enhance church object with dynamic header information
            const enhancedChurch = {
                ...church,
                diocese_name: pastorateSettings?.diocese_name_english || 'Tirunelveli Diocese',
                pastorate_short_name: pastorate?.pastorate_short_name || 'Pastorate',
                church_display_name: churchSettings?.church_name_english || church.church_name
            };

            // Get wedding anniversary members in the date range
            const weddingMembers = await this.db.getWeddingsByDateRange(churchId, fromDate, toDate, areaId);

            // Group members by family
            const familiesWithWeddings = {};
            for (const member of weddingMembers) {
                if (!familiesWithWeddings[member.family_id]) {
                    familiesWithWeddings[member.family_id] = {
                        family: null,
                        members: [],
                        celebrants: []
                    };
                }
                familiesWithWeddings[member.family_id].celebrants.push(member);
            }

            // For each family with wedding celebrants, get all family members and family details
            for (const familyId in familiesWithWeddings) {
                const family = await this.db.getFamilyById(parseInt(familyId));
                if (family) {
                    const area = await this.db.getAreaById(family.area_id);
                    const fellowship = await this.db.getPrayerCellById(family.prayer_cell_id);

                    // Add area and fellowship details to family
                    family.area_name = area ? area.area_name : 'N/A';
                    family.fellowship_name = fellowship ? fellowship.prayer_cell_name : 'N/A';

                    familiesWithWeddings[familyId].family = family;

                    // Get all family members
                    const allFamilyMembers = await this.db.getMembersByFamily(parseInt(familyId));
                    familiesWithWeddings[familyId].members = allFamilyMembers;
                }
            }

            // Convert to array and sort by family ID
            const reportData = Object.values(familiesWithWeddings)
                .filter(data => data.family)
                .sort((a, b) => a.family.id - b.family.id);

            return {
                success: true,
                church: enhancedChurch,
                reportData: reportData,
                dateRange: { fromDate, toDate }
            };
        } catch (error) {
            console.error('Get wedding report data error:', error);
            return { success: false, error: 'Failed to get wedding report data' };
        }
    }
}

module.exports = MemberService;