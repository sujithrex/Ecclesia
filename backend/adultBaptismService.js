class AdultBaptismService {
    constructor(db) {
        this.db = db;
    }

    async createCertificate(certificateData, userId) {
        try {
            // Validate required fields with detailed error messages
            const {
                church_id, certificate_number, when_baptised, christian_name, former_name,
                sex, age, abode, father_name, mother_name, witness_name_1, witness_name_2,
                witness_name_3, where_baptised, signature_who_baptised, certified_rev_name,
                holding_office, certificate_date, certificate_place
            } = certificateData;

            // Check each field and collect missing fields
            const missingFields = [];
            if (!church_id) missingFields.push('Church');
            if (!certificate_number) missingFields.push('Certificate Number');
            if (!when_baptised) missingFields.push('When Baptised');
            if (!christian_name) missingFields.push('Christian Name');
            if (!former_name) missingFields.push('Former Name');
            if (!sex) missingFields.push('Sex');
            if (!age) missingFields.push('Age');
            if (!abode) missingFields.push('Abode');
            if (!father_name) missingFields.push('Father Name');
            if (!mother_name) missingFields.push('Mother Name');
            if (!witness_name_1) missingFields.push('Witness 1');
            if (!witness_name_2) missingFields.push('Witness 2');
            if (!witness_name_3) missingFields.push('Witness 3');
            if (!where_baptised) missingFields.push('Where Baptised');
            if (!signature_who_baptised) missingFields.push('Signature Who Baptised');
            if (!certified_rev_name) missingFields.push('Certified Rev Name');
            if (!holding_office) missingFields.push('Holding Office');
            if (!certificate_date) missingFields.push('Certificate Date');
            if (!certificate_place) missingFields.push('Certificate Place');

            if (missingFields.length > 0) {
                return {
                    success: false,
                    error: `Missing required fields: ${missingFields.join(', ')}`
                };
            }

            // Validate sex field
            const validSex = ['male', 'female'];
            if (!validSex.includes(sex.toLowerCase())) {
                return { success: false, error: 'Sex must be either male or female' };
            }

            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === church_id);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            // Create the certificate
            const result = await this.db.createAdultBaptismCertificate({
                ...certificateData,
                sex: sex.toLowerCase(),
                created_by: userId
            });

            return {
                success: true,
                certificateId: result.id,
                message: 'Certificate created successfully'
            };
        } catch (error) {
            console.error('Create certificate error:', error);
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                return { success: false, error: 'A certificate with this number already exists' };
            }
            return { success: false, error: 'Failed to create certificate' };
        }
    }

    async getCertificatesByChurch(churchId, userId, page = 1, limit = 8) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const offset = (page - 1) * limit;
            const certificates = await this.db.getAdultBaptismCertificatesByChurch(churchId, limit, offset);
            const totalCount = await this.db.getAdultBaptismCertificatesCount(churchId);

            return {
                success: true,
                certificates: certificates,
                pagination: {
                    currentPage: page,
                    totalPages: Math.ceil(totalCount / limit),
                    totalCount: totalCount,
                    limit: limit
                }
            };
        } catch (error) {
            console.error('Get certificates error:', error);
            return { success: false, error: 'Failed to get certificates' };
        }
    }

    async getCertificateById(certificateId, userId) {
        try {
            const certificate = await this.db.getAdultBaptismCertificateById(certificateId);

            if (!certificate) {
                return { success: false, error: 'Certificate not found' };
            }

            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === certificate.church_id);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this certificate' };
            }

            return {
                success: true,
                certificate: certificate
            };
        } catch (error) {
            console.error('Get certificate error:', error);
            return { success: false, error: 'Failed to get certificate' };
        }
    }

    async updateCertificate(certificateId, certificateData, userId) {
        try {
            // Get existing certificate to verify access
            const existing = await this.db.getAdultBaptismCertificateById(certificateId);

            if (!existing) {
                return { success: false, error: 'Certificate not found' };
            }

            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === existing.church_id);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this certificate' };
            }

            // Validate sex field if provided
            if (certificateData.sex) {
                const validSex = ['male', 'female'];
                if (!validSex.includes(certificateData.sex.toLowerCase())) {
                    return { success: false, error: 'Sex must be either male or female' };
                }
                certificateData.sex = certificateData.sex.toLowerCase();
            }

            // Update the certificate
            const result = await this.db.updateAdultBaptismCertificate(certificateId, certificateData);

            if (result.changes === 0) {
                return { success: false, error: 'Certificate not found or no changes made' };
            }

            return {
                success: true,
                message: 'Certificate updated successfully'
            };
        } catch (error) {
            console.error('Update certificate error:', error);
            if (error.message && error.message.includes('UNIQUE constraint failed')) {
                return { success: false, error: 'A certificate with this number already exists' };
            }
            return { success: false, error: 'Failed to update certificate' };
        }
    }

    async deleteCertificate(certificateId, userId) {
        try {
            // Get existing certificate to verify access
            const existing = await this.db.getAdultBaptismCertificateById(certificateId);

            if (!existing) {
                return { success: false, error: 'Certificate not found' };
            }

            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === existing.church_id);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this certificate' };
            }

            // Delete the certificate
            const result = await this.db.deleteAdultBaptismCertificate(certificateId);

            if (result.changes === 0) {
                return { success: false, error: 'Certificate not found' };
            }

            return {
                success: true,
                message: 'Certificate deleted successfully'
            };
        } catch (error) {
            console.error('Delete certificate error:', error);
            return { success: false, error: 'Failed to delete certificate' };
        }
    }

    async getNextCertificateNumber(churchId, userId) {
        try {
            // Verify user has access to the church
            const userChurches = await this.db.getUserChurches(userId);
            const hasAccess = userChurches.some(c => c.id === churchId);

            if (!hasAccess) {
                return { success: false, error: 'You do not have access to this church' };
            }

            const nextNumber = await this.db.getNextCertificateNumber(churchId);

            return {
                success: true,
                certificateNumber: nextNumber
            };
        } catch (error) {
            console.error('Get next certificate number error:', error);
            return { success: false, error: 'Failed to get next certificate number' };
        }
    }

    async getCertificateDataForPDF(certificateId, userId) {
        try {
            // Get certificate data
            const certificateResult = await this.getCertificateById(certificateId, userId);

            if (!certificateResult.success) {
                return certificateResult;
            }

            const certificate = certificateResult.certificate;

            // Get church information
            const church = await this.db.getChurchById(certificate.church_id);

            if (!church) {
                return { success: false, error: 'Church not found' };
            }

            return {
                success: true,
                certificate: certificate,
                church: church
            };
        } catch (error) {
            console.error('Get certificate data for PDF error:', error);
            return { success: false, error: 'Failed to get certificate data' };
        }
    }
}

module.exports = AdultBaptismService;

