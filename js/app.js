let DB; 
//Variables Campos de Formulario
const mascotaInput = document.querySelector('#mascota');
const propietarioInput = document.querySelector('#propietario');
const telefonoInput = document.querySelector('#telefono');
const fechaInput = document.querySelector('#fecha');
const horaInput = document.querySelector('#hora');
const sintomasInput = document.querySelector('#sintomas');

//UI
const formulario = document.querySelector('#nueva-cita'); 
const contenedorCitas = document.querySelector('#citas'); 

let editando;

window.onload = () => {
    eventListeners(); 
    createDB(); 
}


//Clases
class Citas{
    constructor(){
        this.citas = []; 
    }

    agregarCita(cita){
      this.citas = [...this.citas, cita]; 
    }

    eliminarCita(id){
     this.citas = this.citas.filter(cita => cita.id !== id); 
    }

    editarCita(citaActualizada){
     this.citas = this.citas.map(cita => cita.id === citaActualizada.id ? citaActualizada : cita); 
    }

}

class UI{

    imprimirAlerta(mensaje, tipo){
        const divMensaje = document.createElement('DIV'); 
        divMensaje.classList.add('text-center', 'alert', 'd-block', 'col-12');
        
        if(tipo === 'error'){
            divMensaje.classList.add('alert-danger');
        }else{
            divMensaje.classList.add('alert-success');
        }

        divMensaje.textContent = mensaje; 
        document.querySelector('#contenido').insertBefore(divMensaje, document.querySelector('.agregar-cita')); 
        setTimeout(() => {
            divMensaje.remove(); 
        }, 2000);
    }

    imprimirHTML(){
    
        this.limpiarHTML(); 
        
        //Leer contenido de la Base de Datos 
        const objectStore = DB.transaction('citas').objectStore('citas'); 
        objectStore.openCursor().onsuccess = function(e){
          const cursor = e.target.result; 
          if(cursor){
            const {mascota, propietario, telefono, fecha, hora, sintomas, id } = cursor.value;

            const divCita = document.createElement('div');
            divCita.classList.add('cita', 'p-3');
            divCita.dataset.id = id;

            // scRIPTING DE LOS ELEMENTOS...
            const mascotaParrafo = document.createElement('h2');
            mascotaParrafo.classList.add('card-title', 'font-weight-bolder');
            mascotaParrafo.innerHTML = `${mascota}`;

            const propietarioParrafo = document.createElement('p');
            propietarioParrafo.innerHTML = `<span class="font-weight-bolder">Propietario: </span> ${propietario}`;

            const telefonoParrafo = document.createElement('p');
            telefonoParrafo.innerHTML = `<span class="font-weight-bolder">Teléfono: </span> ${telefono}`;

            const fechaParrafo = document.createElement('p');
            fechaParrafo.innerHTML = `<span class="font-weight-bolder">Fecha: </span> ${fecha}`;

            const horaParrafo = document.createElement('p');
            horaParrafo.innerHTML = `<span class="font-weight-bolder">Hora: </span> ${hora}`;

            const sintomasParrafo = document.createElement('p');
            sintomasParrafo.innerHTML = `<span class="font-weight-bolder">Síntomas: </span> ${sintomas}`;

            // Agregar un botón de eliminar...
            const btnEliminar = document.createElement('button');
            btnEliminar.onclick = () => eliminarCita(id); // añade la opción de eliminar
            btnEliminar.classList.add('btn', 'btn-danger', 'mr-2');
            btnEliminar.innerHTML = 'Eliminar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M10 14l2-2m0 0l2-2m-2 2l-2-2m2 2l2 2m7-2a9 9 0 11-18 0 9 9 0 0118 0z"></path></svg>'

            // Añade un botón de editar...
            const btnEditar = document.createElement('button');
            const cita = cursor.value;
            btnEditar.onclick = () => editarCita(cita);

            btnEditar.classList.add('btn', 'btn-info');
            btnEditar.innerHTML = 'Editar <svg fill="none" stroke-linecap="round" stroke-linejoin="round" stroke-width="2" viewBox="0 0 24 24" stroke="currentColor"><path d="M15.232 5.232l3.536 3.536m-2.036-5.036a2.5 2.5 0 113.536 3.536L6.5 21.036H3v-3.572L16.732 3.732z"></path></svg>'

            // Agregar al HTML
            divCita.appendChild(mascotaParrafo);
            divCita.appendChild(propietarioParrafo);
            divCita.appendChild(telefonoParrafo);
            divCita.appendChild(fechaParrafo);
            divCita.appendChild(horaParrafo);
            divCita.appendChild(sintomasParrafo);
            divCita.appendChild(btnEliminar)
            divCita.appendChild(btnEditar)

            contenedorCitas.appendChild(divCita);

            //Ir al siguientev Elemento 
            cursor.continue(); 

          }
        }

        

    }//Fin imprimir HTML

    limpiarHTML(){
        while(contenedorCitas.firstChild){
          contenedorCitas.removeChild(contenedorCitas.firstChild);
        }
    }




}

const ui = new UI(); 
const administrarCitas = new Citas(); 


//Eventos
function eventListeners(){
    mascotaInput.addEventListener('input', datosCita); 
    propietarioInput.addEventListener('input', datosCita); 
    telefonoInput.addEventListener('input', datosCita); 
    fechaInput.addEventListener('input', datosCita); 
    horaInput.addEventListener('input', datosCita); 
    sintomasInput.addEventListener('input', datosCita); 

    formulario.addEventListener('submit', nuevaCita); 
}


const citaObj = { //Objeto de la Informacion de la cita
    mascota: '', 
    propietario: '', 
    telefono: '', 
    fecha: '', 
    hora: '', 
    sintomas: '', 
}

function datosCita(e){
  citaObj[e.target.name] = e.target.value; 
  
}

function nuevaCita(e){
    e.preventDefault(); 

    const { mascota, propietario, telefono, fecha, hora, sintomas } = citaObj;
    if(mascota === '' || propietario === '' || telefono === '' || fecha === '' || hora === '' || sintomas === ''){
       ui.imprimirAlerta('Todos los campos son Obligatorios', 'error'); 
       return; 
    }

    if(editando){
        //Actualizar el Objeto de la cita 
        administrarCitas.editarCita({...citaObj});

        //Editar el Index DB 
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStoreEdit = transaction.objectStore('citas');

        objectStoreEdit.put(citaObj); 

        transaction.oncomplete = () => {
            ui.imprimirAlerta('Actualizado Correctamente'); 
            formulario.querySelector('button[type="submit"]').textContent = 'Crear Cita';
            editando = false; 
        }
    }else{
        //Generar ID
        citaObj.id = Date.now(); 
        
        //Creando una Nueva Cita
        administrarCitas.agregarCita({...citaObj});
        //Insertar Registro en Index DB 
        const transaction = DB.transaction(['citas'], 'readwrite');
        const objectStore = transaction.objectStore('citas'); 
        objectStore.add(citaObj);//Insertar en la Base de Datos
        transaction.oncomplete = function(){
            console.log('Cita Agregada'); 
            //Mensaje de Agregado Correctamente 
            ui.imprimirAlerta('Agregado Correctamente')
        }

       
    }
    
    //Reiniciar el Objeto
    reiniciarObjeto(); 
    //Reiniciar Formulario
    formulario.reset();
    //Mostrar el HTML
    ui.imprimirHTML(); 

}

function reiniciarObjeto(){
    citaObj.mascota =  ''; 
    citaObj.propietario =  ''; 
    citaObj.telefono =  ''; 
    citaObj.fecha =  ''; 
    citaObj.hora =  ''; 
    citaObj.sintomas =  ''; 
}

function eliminarCita(id){
 //Editar el Index DB 
 const transaction = DB.transaction(['citas'], 'readwrite');
 const objectStoreEliminar = transaction.objectStore('citas');

 objectStoreEliminar.delete(id); 

 transaction.oncomplete = () => {
    //Mostrar Mensaje 
 ui.imprimirAlerta('Eliminado Correctamente'); 
 //Refrescar las Citas
 ui.imprimirHTML(); 
}
transaction.onerror = () => {
    console.log('Hubo un error');
}


}

function editarCita(cita){
    const { mascota, propietario, telefono, fecha, hora, sintomas } = cita;

    //Llenar los Inputs 
    mascotaInput.value = mascota; 
    propietarioInput.value = propietario; 
    telefonoInput.value = telefono; 
    fechaInput.value = fecha; 
    horaInput.value = hora; 
    sintomasInput.value = sintomas; 

    //Llenar Objeto 
    citaObj.mascota = mascota; 
    citaObj.propietario = propietario;
    citaObj.telefono = telefono; 
    citaObj.fecha = fecha;
    citaObj.hora = hora;
    citaObj.sintomas = sintomas;  

    formulario.querySelector('button[type="submit"]').textContent = 'Guardar Cambios'; 
    editando = true; 
}


function createDB(){
    //Creamos la Base de Datos Version 1
    const crearDB = window.indexedDB.open('citas', 1);  

    //Si hay un error
    crearDB.onerror = function(){
        console.log('Ups ocurrio un error');
    }

     //Si todo sale bien 
     crearDB.onsuccess = function(){
        console.log('BD Creada');

        DB = crearDB.result;
        
        //Mostrar citas cuando Index DB ya esta lista 
        ui.imprimirHTML();
        
    }

    //Definir el Schema 
    crearDB.onupgradeneeded = function(e){
       const db = e.target.result; 

       const objectStore = db.createObjectStore('citas', {
        keyPath: 'id', 
        autoIncrement: true
       });

       //Definir todas las columnas 
       objectStore.createIndex('mascota', 'mascota', {unique: false});
       objectStore.createIndex('propietario', 'propietario', {unique: false});
       objectStore.createIndex('telefono', 'telefono', {unique: false});     
       objectStore.createIndex('fecha', 'fecha', {unique: false});
       objectStore.createIndex('hora', 'hora', {unique: false});
       objectStore.createIndex('sintomas', 'sintomas', {unique: false});
       objectStore.createIndex('id', 'id', {unique: true}); 

      console.log('DB Creada y Lista'); 
    }

}