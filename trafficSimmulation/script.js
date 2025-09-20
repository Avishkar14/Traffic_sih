document.addEventListener('DOMContentLoaded', () => {

    const intersection = document.getElementById('intersection');
    const allLights = document.querySelectorAll('.light');
    const allSets = document.querySelectorAll('.traffic-light-set');

    const YELLOW_LIGHT_DURATION = 2000; // 2 seconds
    let isTransitioning = false; // Prevents new clicks during a sequence

    // --- HELPER FUNCTIONS ---

    function findActiveGreenSet() {
        let activeSet = null;
        allSets.forEach(set => {
            if (set.querySelector('.green.active')) {
                activeSet = set;
            }
        });
        return activeSet;
    }

    function lockControls() {
        isTransitioning = true;
        intersection.classList.add('locked');
    }

    function unlockControls() {
        isTransitioning = false;
        intersection.classList.remove('locked');
    }

    // --- MAIN CLICK HANDLER ---

    function handleLightClick(event) {
        if (isTransitioning) {
            return;
        }

        const clickedLight = event.target;
        const clickedColor = clickedLight.dataset.color;
        const parentSet = clickedLight.closest('.traffic-light-set');

        // --- RULE FOR BLUE LIGHT (INSTANT OVERRIDE) ---
        if (clickedColor === 'blue') {
            lockControls();
            allLights.forEach(light => light.classList.remove('active'));

            parentSet.querySelector('.green').classList.add('active');
            parentSet.querySelector('.blue').classList.add('active');

            allSets.forEach(set => {
                if (set.id !== parentSet.id) {
                    set.querySelector('.red').classList.add('active');
                    set.querySelector('.blue').classList.add('active');
                }
            });
            
            setTimeout(unlockControls, 200);
            return;
        }

        // --- RULE FOR GREEN LIGHT (START THE SEQUENCE) ---
        if (clickedColor === 'green') {
            if (clickedLight.classList.contains('active')) {
                return;
            }

            lockControls();
            const currentGreenSet = findActiveGreenSet();

            if (currentGreenSet) {
                // --- "BOTH YELLOW" PHASE ---
                // 1. Turn the currently green lane to yellow.
                currentGreenSet.querySelector('.green').classList.remove('active');
                currentGreenSet.querySelector('.yellow').classList.add('active');

                // 2. Turn the requesting (red) lane to yellow simultaneously.
                // First, turn off all its lights (the red one).
                parentSet.querySelectorAll('.light').forEach(l => l.classList.remove('active'));
                parentSet.querySelector('.yellow').classList.add('active');

                // --- RESOLUTION PHASE (after delay) ---
                setTimeout(() => {
                    // 1. The old lane becomes red.
                    currentGreenSet.querySelector('.yellow').classList.remove('active');
                    currentGreenSet.querySelector('.red').classList.add('active');

                    // 2. The new lane becomes green.
                    parentSet.querySelector('.yellow').classList.remove('active');
                    parentSet.querySelector('.green').classList.add('active');

                    unlockControls();
                }, YELLOW_LIGHT_DURATION);

            } else {
                // If no lane was green, just sequence the clicked lane to green.
                parentSet.querySelectorAll('.light').forEach(l => l.classList.remove('active'));
                parentSet.querySelector('.yellow').classList.add('active');

                setTimeout(() => {
                    parentSet.querySelector('.yellow').classList.remove('active');
                    parentSet.querySelector('.green').classList.add('active');
                    unlockControls();
                }, YELLOW_LIGHT_DURATION);
            }
        }
    }
    
    // --- INITIAL STATE ---
    function setInitialState() {
        const set1 = document.getElementById('set-1');
        set1.querySelector('.green').classList.add('active');

        allSets.forEach(set => {
            if (set.id !== 'set-1') {
                set.querySelector('.red').classList.add('active');
            }
        });
    }

    // Add click listeners to all lights
    allLights.forEach(light => {
        light.addEventListener('click', handleLightClick);
    });
    
    // Set the initial state on page load
    setInitialState();
});