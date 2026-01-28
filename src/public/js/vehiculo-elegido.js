document.addEventListener("DOMContentLoaded", function () {
    const selectVehiculo = document.getElementById("seleccion-vehiculo");
    const imgVehiculo = document.getElementById("imagenVehiculo");
    const nombreVehiculo = document.getElementById("nombreVehiculo");

    selectVehiculo.addEventListener("change", function () {
        const selectedOption = selectVehiculo.options[selectVehiculo.selectedIndex];

        const imagen = selectedOption.getAttribute("data-imagen");
        const marca = selectedOption.getAttribute("data-marca");
        const modelo = selectedOption.getAttribute("data-modelo");

        if (imagen && marca && modelo) {
            imgVehiculo.src = imagen;
            imgVehiculo.alt = `${marca} ${modelo}`;
            nombreVehiculo.textContent = `${marca} ${modelo}`;
        } else {
            imgVehiculo.src = "/img/logo/LogoAureon.png";
            nombreVehiculo.textContent = "¡Empieza a mover tu flota de vehículos!"
        }
    });

});