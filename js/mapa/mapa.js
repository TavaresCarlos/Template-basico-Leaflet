function main(){
	var mapa = L.map('mapa').setView([-19.53794677504797, -40.62796643556086], 15);

	L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', { 
		attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'}).addTo(mapa);

	var optionsScale = {
	    metric: true, 
	    imperial: false 
	};

	//Adicionando a barra de escala no mapa (canto inferior esquerdo)
	L.control.scale(optionsScale).addTo(mapa);

	//Camadas wms
    var osm = L.tileLayer.wms('https://tiles.stadiamaps.com/tiles/alidade_smooth/{z}/{x}/{y}{r}.png', '&copy; <a href="https://stadiamaps.com/">Stadia Maps</a>, &copy; <a href="https://openmaptiles.org/">OpenMapTiles</a> &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors');
    var world = L.tileLayer.wms('https://server.arcgisonline.com/ArcGIS/rest/services/World_Imagery/MapServer/tile/{z}/{y}/{x}','Tiles &copy; Esri &mdash; Source: Esri, i-cubed, USDA, USGS, AEX, GeoEye, Getmapping, Aerogrid, IGN, IGP, UPR-EGP, and the GIS User Community');
    
    //Agrupando camadas wms
    var baseMaps = { 
        "OpenStreetMap": osm.addTo(mapa),
        "Satélite": world
    };
                   
    var optionsControl = {
        collapsed: false
    };
    
    L.control.groupedLayers(baseMaps, null, optionsControl).addTo(mapa);

    //Ferramentas
    drawnItems = new L.FeatureGroup();
    mapa.addLayer(drawnItems);
                        
    L.drawLocal.draw.toolbar.buttons.polyline = 'Polyline';
    L.drawLocal.draw.toolbar.buttons.marker = 'Marker';
    L.drawLocal.draw.toolbar.buttons.polygon = 'Polygon';
                        
    drawControl = new L.Control.Draw({
        position: 'topleft',
        draw:{
            polyline:{
                metric: true,
                showLength: true
            },        
            polygon:{
                metric: ['km', 'm'],
                feet: false,
                nautic: false,
                showLength: true,
                showArea: true,
                allowIntersection: false,
                precision:{km: 2}
            },
            circle: false,
            rectangle: false,
			marker: true
        },
        edit:{
            featureGroup: drawnItems,
            remove: true
        }
    });
                            
    mapa.addControl(drawControl);

    //Texto mostrado quando o usuário clica na geometria desenhada
     mapa.on('draw:created', function(e){ 
        var type = e.layerType,
        layer = e.layer;
		
		if(type == 'polyline'){
            //Distância de exemplo
            var distanciaTeste = 0;
                        
            //Calculando na mão o tamanho em 'm' da polyline com base no algoritmo de geodésia (https://www.mapanet.eu/PT/resources/Script-Distance.htm)
            var tamanho = e.layer._latlngs.length;
            for(var i=0; i<tamanho; i++){
                if((i+1) < tamanho){

                    var lat1 = e.layer._latlngs[i].lat;
                    var lat2 = e.layer._latlngs[i+1].lat;

                    var long1 =  e.layer._latlngs[i].lng;
                    var long2 = e.layer._latlngs[i+1].lng;

                    const r = 6378.137;

                    var dLat = ((lat2 - lat1)*Math.PI/180);
                    var dLong = ((long2 - long1)*Math.PI/180);

                    var a = Math.sin(dLat/2) * Math.sin(dLat/2) + Math.cos(lat1*Math.PI/180) * Math.cos(lat2*Math.PI/180) * Math.sin(dLong/2) * Math.sin(dLong/2);
                    var c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
                                            
                    distanciaTeste = distanciaTeste + c*r;
                }
            }
                                    
            //Passando a distância de 'km' para 'm'
            distanciaTeste = (distanciaTeste*1000).toFixed(2);
            layer.bindPopup(distanciaTeste + " m");
        }

        if(type == 'marker'){
             var coord = layer.getLatLng();
		}

        if(type == 'polygon'){
			//Obtendo a area em m2
            var area = L.GeometryUtil.geodesicArea(e.layer.getLatLngs()[0]).toFixed(2);
            layer.bindPopup(area + " m2");
		}

         drawnItems.addLayer(layer); //Define o desenho como uma camada
    });     
}