document.addEventListener('DOMContentLoaded', function () {
    const modalReview = document.getElementById('modalReview');
    let idVehiculo;
    if (modalReview) {
        modalReview.addEventListener('show.bs.modal', function (event) {
            idVehiculo = parseInt(modalReview.getAttribute('data-idvehiculo'));
        });
        document.getElementById('botonReview').addEventListener('click', function () {
            const puntuacion = parseInt(document.getElementById('puntuacionVehiculo').value);
            if (!puntuacion) {
                mostrarMensajeError("Selecciona una puntuación");
                return;
            }
            console.log(`Puntuando vehículo ID ${idVehiculo} con puntuación ${puntuacion}`);
            fetch(`/vehiculos/${idVehiculo}/puntuar`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ puntuacion: puntuacion }) })
                .then(response => {
                    if (!response.ok) {
                        throw new Error(`Error http: ${response.status}`);
                    }
                    return response.json();
                })
                .then(resultado => {

                    if (!resultado.success) {
                        throw new Error(resultado.error || "Error desconocido");
                    }
                    const modal = bootstrap.Modal.getInstance(modalReview);
                    modal.hide();
                    cargarVehiculosDesdeAPI({}, true);
                    cargarReservasDesdeAPI();
                })
                .catch(error => {
                    mostrarMensajeError(error.message);
                });
        });
    }
});