let prevoz;
let routeStorage = [];


function changeType(id) {
	if (id == "peski") {
		prevoz = "walking";
		document.getElementById('prevozno-div').textContent = "Превозно средство: пешки";
	} else if (id == "tocak") {
		prevoz = "cycling";
		document.getElementById('prevozno-div').textContent = "Превозно средство: велосипед";
	} else if (id == "kola") {
		prevoz = "driving";
		document.getElementById('prevozno-div').textContent = "Превозно средство: автомобил";
	} else prevoz = "";

	if (prevoz != "") {
		document.querySelector('.lokacija').style.display = "block";
	}
}


function funk(start) {
	document.querySelector('.tip').style = "position: relative; top: 550px";

	mapboxgl.accessToken = `${ACCESS_TOKEN}`;
	var map = new mapboxgl.Map({
		container: 'map',
		style: 'mapbox://styles/mapbox/streets-v10',
		center: start,
		zoom: 12
	});

	var bounds = [
		[start[0] - 0.3, start[1] - 0.3],
		[start[0] + 0.3, start[1] + 0.3]
	];
	map.setMaxBounds(bounds);

	var canvas = map.getCanvasContainer();

	function getRoute(end) {
		var url = `https://api.mapbox.com/directions/v5/mapbox/${prevoz}/` + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
		var req = new XMLHttpRequest();
		req.open('GET', url, true);
		req.onload = function () {
			var json = JSON.parse(req.response);
			var data = json.routes[0];
			var route = data.geometry.coordinates;
			var geojson = {
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'LineString',
					coordinates: route
				}
			};
			if (map.getSource('route')) {
				map.getSource('route').setData(geojson);
			} else {
				map.addLayer({
					id: 'route',
					type: 'line',
					source: {
						type: 'geojson',
						data: {
							type: 'Feature',
							properties: {},
							geometry: {
								type: 'LineString',
								coordinates: geojson
							}
						}
					},
					layout: {
						'line-join': 'round',
						'line-cap': 'round'
					},
					paint: {
						'line-color': '#3887be',
						'line-width': 5,
						'line-opacity': 0.75
					}
				});
			}
		};
		req.send();
	}

	map.on('load', function () {
		getRoute(start);
		map.addLayer({
			id: 'point',
			type: 'circle',
			source: {
				type: 'geojson',
				data: {
					type: 'FeatureCollection',
					features: [{
						type: 'Feature',
						properties: {},
						geometry: {
							type: 'Point',
							coordinates: start
						}
					}]
				}
			},
			paint: {
				'circle-radius': 10,
				'circle-color': 'green'
			}
		});
		fetch('/apteki')
			.then(response => response.json())
			.then(apteki => {
				apteki.forEach(apteka => {
					map.addLayer({
						id: `${apteka.id}`,
						type: 'circle',
						source: {
							type: 'geojson',
							data: {
								type: 'FeatureCollection',
								features: [{
									type: 'Feature',
									properties: {},
									geometry: {
										type: 'Point',
										coordinates: [apteka.lon, apteka.lat]
									}
								}]
							}
						},
						paint: {
							'circle-radius': 8,
							'circle-color': '#3887be'
						}
					});
					pharms.push(apteka);
				});
			});
	});

	map.on('click', function (e) {
		var coordsObj = e.lngLat;
		canvas.style.cursor = '';
		var coords = Object.keys(coordsObj).map(function (key) {
			return coordsObj[key];
		});
		var end = {
			type: 'FeatureCollection',
			features: [{
				type: 'Feature',
				properties: {},
				geometry: {
					type: 'Point',
					coordinates: coords
				}
			}]
		};
		if (map.getLayer('end')) {
			map.getSource('end').setData(end);
		} else {
			map.addLayer({
				id: 'end',
				type: 'circle',
				source: {
					type: 'geojson',
					data: {
						type: 'FeatureCollection',
						features: [{
							type: 'Feature',
							properties: {},
							geometry: {
								type: 'Point',
								coordinates: coords
							}
						}]
					}
				},
				paint: {
					'circle-radius': 10,
					'circle-color': '#f30'
				}
			});
		}
		getRoute(coords);
	});

	let pharms = [];
	let pharmObjs = [];


	async function sortByDist() {
		for (let el of pharms) {
			data = await getDirections([el.lon, el.lat]);
			el.route = data.routes[0];
			pharmObjs.push(el);
		}
		pharmObjs.sort((a, b) => a.route.distance - b.route.distance);
	}


	async function getDirections(end) {
		let url = `https://api.mapbox.com/directions/v5/mapbox/${prevoz}/` + start[0] + ',' + start[1] + ';' + end[0] + ',' + end[1] + '?steps=true&geometries=geojson&access_token=' + mapboxgl.accessToken;
		const response = await fetch(url);
		const data = await response.json();
		return data;
	}

	document.querySelector('.lokacija').style.display = "none";
	document.querySelector('.tip').style.display = "none";
	document.querySelector('.prevozno').style.display = "none";
	document.querySelectorAll('.legend').forEach(element => element.style.display = "flex");
	document.querySelector('#map').insertAdjacentHTML('afterend', `
	<div id="routes">
		<div style='position: relative; top: 530px;'> 
			<button id="genroutebtn" style="font-size: 20px"> Генерирај рута до најблиската аптека </button>
		</div>
	</div>`);

	document.querySelector("#genroutebtn").onclick = async () => {
		if (document.querySelectorAll('#apteka-info').length == 0) {
			await sortByDist();
			let counter = 0;
			let currentRoute = pharmObjs[counter];
			let shortest = currentRoute.route.distance;

			console.log(pharmObjs[0]);
			getRoute([currentRoute.lon, currentRoute.lat]);

			document.querySelector('#routes').insertAdjacentHTML('beforeend', `
			<div id="apteka-info">
				<span>Име: ${pharmObjs[counter].ime} </span> <br>
				<span>Оддалеченост: ${shortest > 1000 ? (shortest / 1000).toFixed(2) : shortest} ${shortest > 1000 ? "km" : "m"} </span> <br>
				<button id="decroute"> Претходна рута </button>
				<button id="incroute"> Следна рута </button> <br>
				<button id="saveroute" style="background: none; border: 1px solid red; color: black;"> Зачувај рута </button>
			</div>`);

			if (localStorage.getItem('user')) {
				document.getElementById('saveroute').onclick = async () => {
					const response = await fetch('/saveroute', {
						method: 'POST',
						headers: {
							'Content-Type': 'application/json'
						},
						body: JSON.stringify({
							user: localStorage.getItem('user'),
							id: currentRoute.id,
							prevoz,
							startlon: start[0],
							startlat: start[1]
						})
					});
					console.log(await response.text());
				};
			} else {
				document.getElementById('saveroute').style.display = "none";
			}

			let instructions = document.getElementById('instructions');
			instructions.style.display = "block";
			let steps = currentRoute.route.legs[0].steps;

			let tripInstructions = [];
			for (let i = 0; i < steps.length; i++) {
				tripInstructions.push('<br><li>' + steps[i].maneuver.instruction) + '</li>';
				instructions.innerHTML = '<br><span class="duration">Времетраење: ' + Math.floor(currentRoute.route.duration / 60) + ' min 🚴 </span>' + tripInstructions;
			}

			function changeInfo(route) {
				steps = route.route.legs[0].steps;
				tripInstructions = [];
				for (let i = 0; i < steps.length; i++) {
					tripInstructions.push('<br><li>' + steps[i].maneuver.instruction) + '</li>';
					instructions.innerHTML = '<br><span class="duration">Trip duration: ' + Math.floor(route.route.duration / 60) + ' min 🚴 </span>' + tripInstructions;
				}
				shortest = route.route.distance;
				document.querySelector("#apteka-info").children[0].textContent = "Име: " + route.ime;
				document.querySelector("#apteka-info").children[2].textContent = `Оддалеченост: ${shortest > 1000 ? (shortest / 1000).toFixed(2) : shortest} ${shortest > 1000 ? "km" : "m"}`;
			}



			document.getElementById('decroute').onclick = () => {
				if (counter > 0 && counter <= pharmObjs.length) {
					currentRoute = pharmObjs[--counter];
					console.log(currentRoute);
					changeInfo(currentRoute);
					getRoute([currentRoute.lon, currentRoute.lat]);
				}
			}

			document.getElementById('incroute').onclick = () => {
				if (counter < pharmObjs.length) {
					currentRoute = pharmObjs[++counter];
					console.log(currentRoute);
					changeInfo(currentRoute);
					getRoute([currentRoute.lon, currentRoute.lat]);
				}
			}
		}
	}
}