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
}