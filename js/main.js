let params = location.search
let id = new URLSearchParams(params).get("id")

const app = Vue.
	createApp({
		data() {
			return {
				events: [],
				eventsSearch: [],
				eventsSearchUpcoming: [],
				
				category: [],
				selectCategory: [],
				eventrosFiltrados: [],
				input: '',

                idDetails: [],

                table:[],
                tableUp:[],
                tablePast:[],
                upcomingEvents:[],
                pastEvents:[],

                fecha: '',
                    eventoMasCapacidad: [],
                    eventoMayorPorcentaje: [],
                    eventoMenorPorcentaje: []
			}
		},
		created() {
			this.events.push('events')
			fetch('https://amazing-events.herokuapp.com/api/events')
				.then((response) => response.json())
				.then((json) => {
					let docTitle = document.title;
                    this.fecha = json.currentDate
					this.events = json.events;
					this.eventsSearch = this.events
					if (docTitle == "Home") {
						this.events = json.events;
					} else if (docTitle == "Upcoming Events") {
						this.events = this.events.filter(events => events.date >= json.currentDate)
					} else if (docTitle == "Past Events") {
						this.events = this.events.filter(events => events.date <= json.currentDate)
					}else if(docTitle == "Details"){
                        this.idDetails = this.events.find(element => element._id == id)
                    }else if(docTitle == 'Stats'){
                        this.upEvents = this.events.filter((event)=> event.date > json.currentDate)
                        this.pastEvents = this.events.filter((event)=> event.date < json.currentDate)
                        this.tablaUp = this.calculadora(this.upEvents)
                        this.pastEvents = this.calculadora(this.pastEvents)
                        this.upcomingEvents = this.events.filter((event)=> event.date > json.currentDate)
                        this.tableUp = this.calculadora(this.upcomingEvents)
                        this.tablePast = this.calculadora(this.pastEvents)
                        this.conseguirMayorCapacidad()
                        this.conseguirAsistencias(this.events.filter(evento => evento.date < this.fecha))
                    }
					this.events.forEach(event => {
						if (!this.category.includes(event.category)){
							this.category.push(event.category)
						}
					})
				})
				.catch((error) => console.log(error))
		},
		mounted() { },
		methods: {
			filterSerch(eventsArray) {
				this.eventosFiltrados = eventsArray.filter(item => item.name.toLowerCase().includes(this.input.toLowerCase()))
			},
            calculadora(array) {
                let arraysinduplicados = []
                array.forEach(evento => {
                    if (!arraysinduplicados.includes(evento.category)) {
                        arraysinduplicados.push(evento.category)
                    }})
                    let arraycalculos = []
                        arraysinduplicados.forEach(category => {
                            let categoriasAgrupadas = array.filter(events => events.category == category)
                            let ingresos = categoriasAgrupadas.map(events => (events.estimate? events.estimate : events.assistance) * events.price)
                            let totalIngresos = ingresos.reduce((a, b) => a = a + b, 0)
                            let porcentaje = categoriasAgrupadas.map(events =>((events.estimate? events.estimate : events.assistance) / events.capacity))
                            let totalPorcentaje = porcentaje.reduce((a, b) => a = a + b, 0);
                            arraycalculos.push([category, totalIngresos, parseInt(totalPorcentaje / categoriasAgrupadas.length*100)])
                        })
                        return arraycalculos
        },
            conseguirMayorCapacidad(){
				let capacidades = this.events.map(event => event.capacity)
				this.eventoMasCapacidad = this.events.find(event => event.capacity == Math.max(...capacidades))
            },
    		conseguirAsistencias(eventosPasados){
				let asistencias = eventosPasados.map(event => event.assistance / event.capacity)
				this.eventoMayorPorcentaje = eventosPasados.find(event => event.assistance / event.capacity == Math.max(...asistencias))
				this.eventoMenorPorcentaje = eventosPasados.find(event => event.assistance / event.capacity == Math.min(...asistencias))
},
        },
		computed: {
			selectCheck(){
				if (this.selectCategory.length != 0) {
					this.eventosFiltrados = this.events.filter(event => this.selectCategory.includes(event.category))
				} else {
					this.eventosFiltrados = this.events
				} 
				if (this.input!=""){
					this.filterSerch(this.eventosFiltrados)
				}
			}
		},
	}).mount('#app')