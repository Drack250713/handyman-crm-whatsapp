// Función para enviar el lead desde el formulario de la Landing Page
async function enviarLeadCrm(event) {
    event.preventDefault(); // Evita que la página se recargue

    // Estructura de datos requerida por el backend multi-tenant de CreSer CRM
    const emailInput = document.getElementById('email');
    const projectDetailsInput = document.getElementById('detalles');

    const leadData = {
        user_id: 1, // ID del administrador (CreSer Marketing)
        customer_name: document.getElementById('nombre').value,
        phone: document.getElementById('telefono').value,
        zip_code: document.getElementById('codigo_postal').value,
        service_type: document.getElementById('servicio').value,
        email: emailInput ? emailInput.value : null,
        project_details: projectDetailsInput ? projectDetailsInput.value : null
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/api/leads/web', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json'
            },
            body: JSON.stringify(leadData)
        });

        const result = await response.json();

        if (response.ok) {
            console.log('✅ Lead registrado en el CRM con éxito:', result);
            alert('¡Gracias! Tu solicitud ha sido recibida y se ha enviado una alerta de WhatsApp al administrador.');
            // Aquí puedes redirigir o limpiar el formulario
        } else {
            console.error('❌ Error en el servidor:', result);
            alert('Hubo un problema al procesar tu solicitud.');
        }
    } catch (error) {
        console.error('❌ Error de conexión con la API:', error);
        alert('No se pudo establecer comunicación con el servidor del CRM.');
    }
}
