window.onload = async function () {
    if (localStorage.getItem('user')) {
        document.querySelector('#logreg').remove();
        document.getElementById('welcome').textContent = document.getElementById('welcome').textContent + localStorage.getItem('user_name');
    }
    else {
        let warning = document.createElement('div');
        warning.className = "vreme";
        warning.innerHTML = `Please log in`;
        warning.onclick = () => window.location.href = "/najavailireg.html";
        warning.onmouseover = function () {
            this.style.cursor = "pointer";
        }
        warning.style = "position:relative; top: 50px; padding: 10px;";
        document.querySelector('.routes-main').remove();
        document.querySelector("body").append(warning);
    }

    mapboxgl.accessToken = `${ACCESS_TOKEN}`;

    async function getDirections(start, end, prevoz) {
        let url = `https://api.mapbox.com/directions/v5/mapbox/${prevoz}/` + start[0] + ',' + start[
                1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' +
            mapboxgl.accessToken;
        const response = await fetch(url);
        const data = await response.json();
        return data;
    }

    let response = await fetch(`/routes/${localStorage.getItem('user')}`);
    let myroutes = await response.json();

    response = await fetch('/apteki');
    let pharms = await response.json();
    pharms = pharms.filter(el => {
        for (let route of myroutes) {
            if (route.routeid == el.id)
                return true;
        }
    });

    for (let route of myroutes) {
        for (let pharm of pharms) {
            if (pharm.id == route.routeid) {
                route.endlon = pharm.lon;
                route.endlat = pharm.lat;
                route.doapteka = pharm.ime;
                break;
            }
        }
        let data = await getDirections([route.startlon, route.startlat], [route.endlon, route.endlat], route.prevoz);
        route.route = data.routes[0];
    }

    for (let route of myroutes) {
        route.doapteka = route.doapteka.split(" ");
        if (route.prevoz == "walking") route.prevoz = "Пешки";
        else if (route.prevoz == "cycling") route.prevoz = "Велосипед";
        else if (route.prevoz == "driving") route.prevoz = "Автомобил";
        let routeData = document.createElement('div');
        routeData.className = "route-data";
        routeData.innerHTML = `
            <div> ${route.doapteka[0]} </div>
            <div> ${Math.round(route.route.duration / 60)} m </div>
            <div> ${route.route.distance > 1000 ? (route.route.distance / 1000).toFixed(2) : route.route.distance} 
            ${ route.route.distance> 1000 ? "km" : "m"} 
            </div>
            <div> ${route.prevoz} </div>
        `;
        document.querySelector('.routes').append(routeData);
    }

}