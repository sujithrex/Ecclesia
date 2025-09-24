const DatabaseManager = require('./database.js');

class DummyDataGenerator {
  constructor() {
    this.db = new DatabaseManager();
  }

  async generateDummyData() {
    try {
      console.log('Starting dummy data generation...');
      
      // Wait for database to be ready
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // Get all churches to add areas and prayer cells
      const churches = await this.db.getAllChurches();
      
      if (churches.length === 0) {
        console.log('No churches found. Please create at least one church first.');
        return;
      }

      for (const church of churches) {
        console.log(`Generating data for church: ${church.church_name}`);
        
        // Generate Areas for each church
        const areas = [
          { name: 'North Area', identity: 'NORTH-01' },
          { name: 'South Area', identity: 'SOUTH-01' },
          { name: 'East Area', identity: 'EAST-01' },
          { name: 'West Area', identity: 'WEST-01' },
          { name: 'Central Area', identity: 'CENT-01' },
          { name: 'Youth Area', identity: 'YOUTH-01' },
          { name: 'Senior Area', identity: 'SENIOR-01' },
          { name: 'Family Area', identity: 'FAMILY-01' },
        ];

        for (const area of areas) {
          try {
            const result = await this.db.createArea(church.id, area.name, area.identity);
            if (result.success) {
              console.log(`  Created area: ${area.name}`);
            }
          } catch (error) {
            // Ignore duplicate errors
            if (!error.message.includes('UNIQUE constraint failed')) {
              console.error(`  Error creating area ${area.name}:`, error.message);
            }
          }
        }

        // Generate Prayer Cells for each church
        const prayerCells = [
          { name: 'Morning Glory', identity: 'MG-01' },
          { name: 'Faith Warriors', identity: 'FW-01' },
          { name: 'Praise Team', identity: 'PT-01' },
          { name: 'Holy Spirit', identity: 'HS-01' },
          { name: 'Blessed Hope', identity: 'BH-01' },
          { name: 'Living Waters', identity: 'LW-01' },
          { name: 'Rock of Ages', identity: 'RA-01' },
          { name: 'Grace & Peace', identity: 'GP-01' },
          { name: 'Victory Cell', identity: 'VC-01' },
          { name: 'Miracle Workers', identity: 'MW-01' },
        ];

        for (const cell of prayerCells) {
          try {
            const result = await this.db.createPrayerCell(church.id, cell.name, cell.identity);
            if (result.success) {
              console.log(`  Created prayer cell: ${cell.name}`);
            }
          } catch (error) {
            // Ignore duplicate errors
            if (!error.message.includes('UNIQUE constraint failed')) {
              console.error(`  Error creating prayer cell ${cell.name}:`, error.message);
            }
          }
        }
      }
      
      console.log('Dummy data generation completed successfully!');
      
    } catch (error) {
      console.error('Error generating dummy data:', error);
    } finally {
      this.db.close();
    }
  }
}

// Run the generator if this script is executed directly
if (require.main === module) {
  const generator = new DummyDataGenerator();
  generator.generateDummyData().then(() => {
    process.exit(0);
  });
}

module.exports = DummyDataGenerator;