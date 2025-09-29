// Font loading test utility to verify Tamil and celebrant fonts are working
export async function testFontLoading() {
    console.log('🧪 Starting font loading test...');
    
    const testResults = {
        assetsImport: false,
        publicFetch: false,
        tamilDetection: false,
        celebrantFont: false
    };
    
    try {
        // Test 1: Import from assets
        try {
            const timesUrl = (await import('../assets/times.ttf?url')).default;
            const vijayaUrl = (await import('../assets/vijaya.ttf?url')).default;
            const pizzaStarsUrl = (await import('../assets/PIZZADUDESTARS.ttf?url')).default;
            
            console.log('📁 Asset URLs:', { timesUrl, vijayaUrl, pizzaStarsUrl });
            
            const responses = await Promise.all([
                fetch(timesUrl),
                fetch(vijayaUrl),
                fetch(pizzaStarsUrl)
            ]);
            
            if (responses.every(r => r.ok)) {
                testResults.assetsImport = true;
                console.log('✅ Assets import test: PASSED');
            } else {
                console.log('❌ Assets import test: FAILED');
            }
        } catch (error) {
            console.log('❌ Assets import test: FAILED -', error.message);
        }
        
        // Test 2: Public folder fetch
        try {
            const responses = await Promise.all([
                fetch('./times.ttf'),
                fetch('./vijaya.ttf'),
                fetch('./PIZZADUDESTARS.ttf')
            ]);
            
            if (responses.every(r => r.ok)) {
                testResults.publicFetch = true;
                console.log('✅ Public fetch test: PASSED');
            } else {
                console.log('❌ Public fetch test: FAILED');
                responses.forEach((r, i) => {
                    const names = ['times.ttf', 'vijaya.ttf', 'PIZZADUDESTARS.ttf'];
                    console.log(`   ${names[i]}: ${r.status}`);
                });
            }
        } catch (error) {
            console.log('❌ Public fetch test: FAILED -', error.message);
        }
        
        // Test 3: Tamil text detection
        const tamilTexts = [
            'அன்பு', // Love
            'நம்பிக்கை', // Hope
            'சந்தோஷம்', // Joy
            'திருவாசகம்' // Sacred word
        ];
        
        const englishTexts = [
            'John',
            'Mary',
            'Love',
            'Hope'
        ];
        
        // Test Tamil detection function
        const isTamilText = (text) => {
            if (!text || typeof text !== 'string') return false;
            const tamilRange = /[\u0B80-\u0BFF]/;
            return tamilRange.test(text);
        };
        
        const tamilDetected = tamilTexts.every(text => isTamilText(text));
        const englishNotDetected = englishTexts.every(text => !isTamilText(text));
        
        if (tamilDetected && englishNotDetected) {
            testResults.tamilDetection = true;
            console.log('✅ Tamil detection test: PASSED');
            console.log('   Tamil texts detected:', tamilTexts.map(t => `"${t}"`).join(', '));
        } else {
            console.log('❌ Tamil detection test: FAILED');
        }
        
        // Test 4: Font availability check
        try {
            if (testResults.assetsImport || testResults.publicFetch) {
                testResults.celebrantFont = true;
                console.log('✅ Celebrant font availability: PASSED');
            }
        } catch (error) {
            console.log('❌ Celebrant font availability: FAILED');
        }
        
    } catch (error) {
        console.error('🚨 Font test failed:', error);
    }
    
    // Summary
    console.log('\n📊 Font Test Results:');
    console.log('======================');
    Object.entries(testResults).forEach(([test, passed]) => {
        console.log(`${passed ? '✅' : '❌'} ${test}: ${passed ? 'PASSED' : 'FAILED'}`);
    });
    
    const overallSuccess = Object.values(testResults).every(result => result === true);
    console.log(`\n🎯 Overall: ${overallSuccess ? '✅ ALL TESTS PASSED' : '⚠️ SOME TESTS FAILED'}`);
    
    if (!overallSuccess) {
        console.log('\n🔧 Troubleshooting Tips:');
        if (!testResults.assetsImport && !testResults.publicFetch) {
            console.log('• Check if font files exist in both frontend/src/assets/ and frontend/public/');
            console.log('• Verify build system is copying fonts to public folder');
            console.log('• Check network tab for font loading errors');
        }
        if (!testResults.tamilDetection) {
            console.log('• Tamil text detection may have regex issues');
        }
    }
    
    return testResults;
}

// Quick Tamil test strings for debugging
export const tamilTestStrings = {
    names: ['அன்பு', 'சந்தோஷம்', 'நம்பிக்கை'],
    places: ['சென்னை', 'திருநெல்வேலி', 'கோவை'],
    relations: ['தந்தை', 'தாயார்', 'மகன்', 'மகள்']
};

// Test celebrant marker strings (should show as stars when using PIZZADUDESTARS font)
export const celebrantTestStrings = {
    names: ['John ★', 'Mary ★', 'Peter ★'],
    markers: ['★', '✦', '⭐', '🌟']
};