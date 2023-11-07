function searchByTable() {
    const inputSearchByTable = document.querySelectorAll("input[searchByTable]");
    if (inputSearchByTable.length >= 0) {
        inputSearchByTable.forEach(element => {
            const id = element.getAttribute("searchByTable");
            element.setAttribute("onKeyUp", `searchByTableLink(this,'${id}')`)
        })
    }
}

async function searchByTableLink(inputTxt, idTable) {
    const divTableSearch = document.querySelector(`div[id=${idTable}]`);
    const inputVal =
        inputTxt.value =
        inputTxt.value.toUpperCase();
    if (divTableSearch != null && typeof inputTxt == "object" && inputVal.length >= 3) {
        const $json = async function (url, idTable, inputVal) {
            const formData = new FormData();
            formData.append("type", idTable);
            formData.append("searchParam", inputVal);
            const request = new Request(url, {
                method: "POST",
                body: formData,
                mode: 'same-origin',
                credentials: 'include',
            });
            const $data = await fetch(request);
            if (!$data.ok) {
                alert(await $data.text())
                throw new Error($data.statusText());
            }
            return $data.json();
        }
        const url = divTableSearch.getAttribute("searchByTableUri");
        const fn = divTableSearch.getAttribute("searchByTableFunc");
        alterStyleDivTableSearch(divTableSearch, true);
        if (url != null) {
            try {
                let data = await $json(url, idTable, inputVal);
                let i = 0;
                if (typeof data == "object" && "data" in data) {
                    data = data.data.map(option => {
                        option = Object.assign(option, { "Select": `<button type="button" onclick="inputValSearchByTable(${i}, '${idTable}')"><i class="material-icons" style="font-size:140%">send</i></button>` })
                        i++;
                        return option;
                    });
                    divTableSearch.innerHTML = `
                    <table id="table_${idTable}" class="tableSearch">
                        <thead><tr></tr></thead>
                        <tbody></tbody>
                    </table>`;
                    const tableHead = divTableSearch.querySelector("table thead tr");
                    const tableBody = divTableSearch.querySelector("table tbody");
                    const keys = Object.keys(data[0]);
                    let htmlBody = "";
                    keys.forEach(element => {
                        tableHead.innerHTML += `<th>${element}</th>`
                    })
                    i = 0;
                    data.forEach((array) => {
                        htmlBody += `<tr iterate="${i}">`;
                        keys.forEach(element => {
                            htmlBody += `<td>${array[element]}</td>`
                        })
                        htmlBody += "</tr>";
                        i++;
                    })
                    tableBody.innerHTML = htmlBody;
                    return eventTableSearchByTable(`${idTable}`);
                } else {
                    return alterStyleDivTableSearch(divTableSearch);
                }
            } catch (objError) {
                alterStyleDivTableSearch(divTableSearch);
                console.log(objError);
            }
        } else if (fn != null) {
            return window[fn](inputVal, divTableSearch);
        }
    } else if (divTableSearch != null) {
        alterStyleDivTableSearch(divTableSearch);
    }
}

function alterStyleDivTableSearch(div, bool) {
    div.style = "";
    if (bool) {
        div.classList.add("showTableSearch")
    } else {
        div.innerHTML = "";
        div.classList.remove("showTableSearch")
    }
}

function inputValSearchByTable(id, idTable) {
    const table = document.getElementById(`table_${idTable}`);
    if (table) {
        const row = table.querySelector(`[iterate="${id}"]`);
        const celds = row.getElementsByTagName("td");
        if (celds) {
            let data = [];
            for (let i = 0; i < celds.length; i++) {
                if (i == celds.length - 1) {
                    continue;
                }
                data[i] = celds[i].textContent;
            }
            document.querySelector(`[searchByTable='${idTable}']`).value = celds[0].textContent;
            alterStyleDivTableSearch(document.getElementById(idTable))
            let dataSession = JSON.parse(sessionStorage.getItem("searchByTable"));
            if (dataSession) {
                dataSession[`${idTable}`] = data;
                return sessionStorage.setItem("searchByTable", JSON.stringify(dataSession));
            } else {
                let temp = {};
                temp[`${idTable}`] = data;
                return sessionStorage.setItem("searchByTable", JSON.stringify(temp));
            }
        }
    }
    alterStyleDivTableSearch(document.getElementById(idTable))
}

function eventTableSearchByTable(idTable) {
    // Obtén una referencia al div
    try{
        window.addEventListener("click", function (event) {
            if (!document.querySelector(`#table_${idTable}`).contains(event.target)) {
                alterStyleDivTableSearch(document.querySelector(`#${idTable}`));
                document.querySelector(`input[searchByTable=${idTable}]`).value = ""
                document.removeEventListener("click", () => { });
            }
        })
    }catch{
        return;
    }
}