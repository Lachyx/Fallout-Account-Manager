window.addEventListener("DOMContentLoaded", async () => {
    try {
      const AccountsData = await window.electronAPI.loadAccounts();
  
      function addAccounts() {
        if (AccountsData && AccountsData.characterInventories) {
          const AccountsContainer = document.querySelector(".accounts");
          AccountsContainer.innerHTML = "";
    
          const AccountNames = Object.keys(AccountsData.characterInventories);
    
          if (!AccountNames.length) {
            AccountsContainer.textContent = "No accounts available.";
            return;
          }
    
          AccountNames.forEach((Name) => {
            const Account = AccountsData.characterInventories[Name];
    
            if (Account && Account.CharacterInfoData && Account.AccountInfoData) {
              const AccountDiv = document.createElement("div");
              AccountDiv.classList.add("account-block");
              AccountDiv.textContent = `${Account.AccountInfoData.name}:${Account.CharacterInfoData.name}`;
              AccountDiv.addEventListener("click", () => {
                document.getElementById("character-name").textContent =
                  Account.CharacterInfoData.name;
                document.getElementById("account-name").textContent =
                  Account.AccountInfoData.name;
                LoadInventory(Account);
              });
    
              AccountsContainer.appendChild(AccountDiv);
            } else {
              console.error(`Missing data for account: ${Name}`);
            }
          });
        } else {
          console.error("Accounts data or characterInventories is not defined.");
          document.querySelector(".accounts").textContent = "Error loading accounts.";
        }
      }
      addAccounts()
  
    } catch (Error) {
      console.error("Failed to load accounts:", Error);
      document.querySelector(".accounts").textContent = "Error loading accounts.";
    }
  });

function LoadInventory(Account) {
  if (Account && (Account.playerInventory || Account.stashInventory)) {
    const PlayerInventory = Account.playerInventory || [];
    const StashInventory = Account.stashInventory || [];
    const CombinedInventory = PlayerInventory.concat(StashInventory);

    const DescriptionTally = {};

    CombinedInventory.forEach((Item) => {
      const ItemName = Item.text;
      const ItemCount = Item.count || 1;
      let DescriptionFound = false;

      Item.ItemCardEntries.forEach((Entry) => {
        if (Entry.text === "DESC") {
          DescriptionFound = true;
          const Key = `${ItemName} - ${Entry.value}`;

          if (DescriptionTally[Key]) {
            DescriptionTally[Key] += ItemCount;
          } else {
            DescriptionTally[Key] = ItemCount;
          }
        }
      });

      if (!DescriptionFound) {
        const Key = `${ItemName}`;
        if (DescriptionTally[Key]) {
          DescriptionTally[Key] += ItemCount;
        } else {
          DescriptionTally[Key] = ItemCount;
        }
      }
    });

    const DetailsBlock = document.querySelector(".details-block");
    const SearchBar = document.getElementById("search-bar");
    const ItemCount = document.getElementById("item-count");

    function DisplayItems(FilteredItems) {
      const ItemsContainer = document.createElement("div");
      FilteredItems.forEach(([Key, Count], Index) => {
        const ItemDiv = document.createElement("div");
        ItemDiv.className = "item";

        const Content = document.createElement("p");
        Content.textContent = `${Key}: ${Count}`;

        const Description = document.createElement("div");
        Description.className = "description";
        Description.style.display = "none";
        Description.innerHTML = `<p>${Key}</p>`;
        ItemDiv.appendChild(Content);
        ItemDiv.appendChild(Description);
        ItemsContainer.appendChild(ItemDiv);

        setTimeout(() => {
          ItemDiv.classList.add("visible");
        }, Index * 5);
      });

      const OldItems = DetailsBlock.querySelectorAll(".item");
      OldItems.forEach((item) => item.remove());
      DetailsBlock.appendChild(ItemsContainer);

      ItemCount.textContent = `${FilteredItems.length}/${Object.keys(DescriptionTally).length}`;
    }

    const ItemsArray = Object.entries(DescriptionTally);
    DisplayItems(ItemsArray);

    SearchBar.addEventListener("input", () => {
      const SearchTerm = SearchBar.value.toLowerCase();
      const FilteredItems = ItemsArray.filter(([Key]) =>
        Key.toLowerCase().includes(SearchTerm)
      );
      DisplayItems(FilteredItems);
    });
  } else {
    console.error("No inventory data found for the selected account.");
    document.querySelector(".details-block").textContent = "No inventory data available.";
    document.getElementById("item-count").textContent = "0/0";
  }
}