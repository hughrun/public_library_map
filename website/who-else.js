(async function(){
    // load the data
const local = await d3.dsv( ',', '/data/library_services_information.csv', (d) => {
    return {
        name: d.long_name,
        ils: d.ILS,
        state: d.state.toUpperCase(),
        url: d.website
    }
    });
    const nsla = await d3.dsv(',', '/data/nsla_library_locations.csv', (d) => {
    return {
        name: d.town,
        ils: d.ils,
        url: d.url
    }
    });
    const academic = await d3.dsv(',', '/data/academic_library_locations.csv', (d) => {
    return {
        name: d.town,
        ils: d.ils,
        discovery: d.discovery,
        url: d.url
    }
    });

    const data = [...local, ...nsla, ...academic]

    const ils_systems = []
    const disc_systems = []
    for (let d of data) {
    ils_systems.push(d.ils)
    disc_systems.push(d.discovery)
    }
    const values = new Set(ils_systems.sort())
    const ils = document.getElementById('ils')
    for (let val of values) {
        const option = document.createElement('option')
        option.innerText = val
        ils.appendChild(option)
    }

    const discoveries = new Set(disc_systems.sort())
    const discovery = document.getElementById('discovery')
    for (let val of discoveries) {
    if (val) {
        const option = document.createElement('option')
        option.innerText = val
        discovery.appendChild(option)
    }
    }

    // watch for a query
    const form = document.getElementById('form')

    form.addEventListener('submit', (event) => {
        event.preventDefault()
        let listing = document.getElementById('libraries')
        // clear
        while (listing.firstChild) {
        listing.removeChild(listing.firstChild);
        }

        let ils = event.target.ils.value == "---" ? null : event.target.ils.value
        let discovery = event.target.discovery.value == "---" ? null : event.target.discovery.value

        var libraries = []
        if (ils && !discovery) {
        libraries = data.filter( (lib) => lib.ils == ils).sort( (a,b) => {
            return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
        })
        } else if (discovery && !ils) {
        libraries = data.filter( (lib) => lib.discovery == discovery).sort( (a,b) => {
            return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
        })
        } else {
        let ils_libs = data.filter( (lib) => lib.ils == ils)
        libraries = ils_libs.filter( (lib) => lib.discovery == discovery).sort( (a,b) => {
            return (a.name < b.name) ? -1 : (a.name > b.name) ? 1 : 0;
        })
        }

        // account for no disovery listed or neither
        for (let lib of libraries) {
        const li = document.createElement('li')
        if (lib.url) {
        li.innerHTML = `<a target="_blank" href="${lib.url}" rel="noopener noreferrer">${lib.name}</a>`
        } else {
        li.innerText = lib.name
        }
        if (lib.state) {
        li.innerHTML += ` (${lib.state})`
        }

        listing.appendChild(li)
    }
    })
})()