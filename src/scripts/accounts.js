window.addEventListener('DOMContentLoaded', async () => {
    try {
        const accounts = await window.electronAPI.loadAccounts();

        if (accounts && accounts.characterInventories) {
            const accountsContainer = document.querySelector('.accounts');
            
            accountsContainer.innerHTML = '';

            const accountNames = Object.keys(accounts.characterInventories);

            if (accountNames.length === 0) {
                accountsContainer.textContent = "No accounts available.";
                return;
            }

            accountNames.forEach((name) => {
                const account = accounts.characterInventories[name];
                
                if (account && account.CharacterInfoData && account.AccountInfoData) {
                    const accountDiv = document.createElement('div');
                    accountDiv.classList.add('account-block');
                    accountDiv.textContent = `${account.AccountInfoData.name}:${account.CharacterInfoData.name}`;
                    accountDiv.addEventListener('click', () => {
                        document.getElementById('character-name').textContent = account.CharacterInfoData.name;
                        document.getElementById('account-name').textContent = account.AccountInfoData.name;
                        loadInventory(account);
                    });

                    accountsContainer.appendChild(accountDiv);
                } else {
                    console.error(`Missing data for account: ${name}`);
                }
            });
        } else {
            console.error("Accounts data or characterInventories is not defined.");
            document.querySelector('.accounts').textContent = "Error loading accounts.";
        }
    } catch (error) {
        console.error("Failed to load accounts:", error);
        document.querySelector('.accounts').textContent = "Error loading accounts.";
    }
});

function loadInventory(account) {
    if (account && (account.playerInventory || account.stashInventory)) {
        const playerInventory = account.playerInventory || [];
        const stashInventory = account.stashInventory || [];
        const inventory = playerInventory.concat(stashInventory);

        const descTally = {};

        inventory.forEach(item => {
            const itemName = item.text;
            let descFound = false;

            item.ItemCardEntries.forEach(entry => {
                if (entry.text === "DESC" && !item.isQuestItem) {
                    descFound = true;
                    const key = `${itemName} - ${entry.value}`;

                    if (descTally[key]) {
                        descTally[key]++;
                    } else {
                        descTally[key] = 1;
                    }
                }
            });

            if (!descFound && !item.isQuestItem) {
                const key = `${itemName}`;
                if (descTally[key]) {
                    descTally[key]++;
                } else {
                    descTally[key] = 1;
                }
            }
        });

        const detailsBlock = document.querySelector('.details-block');
        const searchBar = document.getElementById('search-bar');
        
        function displayItems(filteredItems) {
            detailsBlock.innerHTML = '';
            filteredItems.forEach(([key, count], index) => {
                const div = document.createElement('div');
                div.className = 'item';

                const content = document.createElement('p');
                content.textContent = `${key}: ${count}`;
                
                const description = document.createElement('div');
                description.className = 'description';
                description.style.display = 'none';
                description.innerHTML = `<p>${key}</p>`;
                div.appendChild(content);
                div.appendChild(description);
                detailsBlock.appendChild(div);

                setTimeout(() => {
                    div.classList.add('visible');
                }, index * 25);
            });
        }
        
        const itemsArray = Object.entries(descTally);
        displayItems(itemsArray);
        
        searchBar.addEventListener('input', () => {
            const searchTerm = searchBar.value.toLowerCase();
            const filteredItems = itemsArray.filter(([key]) => key.toLowerCase().includes(searchTerm));
            detailsBlock.innerHTML = '';
            displayItems(filteredItems);
        });
    } else {
        console.error("No inventory data found for the selected account.");
        document.querySelector('.details-block').textContent = "No inventory data available.";
    }
}
