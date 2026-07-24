async function enviarLeadCrm(event) {
    if (event) {
        if (typeof event.preventDefault === 'function') {
            event.preventDefault();
        }
        if (typeof event.stopPropagation === 'function') event.stopPropagation();
    }

    const formElement = document.getElementById('quote-form');
    const submitBtn = document.getElementById('submit-btn');

    // Validación de seguridad por si se invoca programáticamente
    if (formElement && typeof formElement.checkValidity === 'function' && !formElement.checkValidity()) {
        formElement.reportValidity();
        return false;
    }

    if (submitBtn) {
        submitBtn.innerText = "Sending...";
        submitBtn.disabled = true;
    }

    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value : '';
    };

    const leadData = {
        user_id: 1,
        customer_name: getVal('nombre'),
        phone: (getVal('telefono') || '').replace(/\D/g, ''),
        zip_code: getVal('codigo_postal'),
        service_type: getVal('servicio'),
        preferred_contact: getVal('metodo_contacto'),
        email: getVal('email') || null,
        project_details: getVal('detalles') || null
    };

    try {
        const response = await fetch('http://127.0.0.1:5000/api/leads/web', {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
                'Accept': 'application/json'
            },
            body: JSON.stringify(leadData)
        });

        const result = await response.json();

        if (response.ok) {
            // 1. Crear e inyectar el mensaje verde de éxito
            if (formElement) {
                let msgEl = document.getElementById('success-message-crm');
                if (!msgEl) {
                    msgEl = document.createElement('div');
                    msgEl.id = 'success-message-crm';
                    msgEl.style.cssText = 'margin-top: 20px; padding: 16px; background-color: #28a745; color: #ffffff; text-align: center; font-weight: bold; font-size: 18px; border-radius: 6px; box-shadow: 0 4px 6px rgba(0,0,0,0.1); width: 100%; display: block;';
                    formElement.insertAdjacentElement('afterend', msgEl);
                }
                msgEl.innerText = '¡Gracias! Tu solicitud ha sido enviada con éxito.';
                msgEl.style.display = 'block'; // Asegurar que sea visible

                setTimeout(() => {
                    msgEl.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
                }, 100);
            }

            // 2. Limpiar campos sin disparar las alertas rojas de validación
            const inputIds = ['nombre', 'telefono', 'email', 'codigo_postal', 'metodo_contacto', 'servicio', 'detalles'];
            inputIds.forEach(id => {
                const el = document.getElementById(id);
                if (el) {
                    el.value = '';
                    if (el.classList) el.classList.remove('is-invalid');
                }
            });
        } else {
            alert('Error en el servidor: ' + (result.detail || 'No se pudo procesar la solicitud.'));
        }

    } catch (error) {
        console.error("Error en fetch:", error);
        alert('No se pudo conectar con el servidor backend en el puerto 5000.');
    } finally {
        if (submitBtn) {
            submitBtn.innerText = "Submit Request";
            submitBtn.disabled = false;
        }
    }

    return false;
}

window.enviarLeadCrm = enviarLeadCrm;

document.addEventListener('DOMContentLoaded', () => {
    const form = document.getElementById('quote-form');
    const submitBtn = document.getElementById('submit-btn');

    if (form && submitBtn) {
        submitBtn.addEventListener('click', async function(e) {
            e.preventDefault(); 
            
            // Validar manualmente para disparar tooltips HTML5 si faltan datos
            if (!form.checkValidity()) {
                form.reportValidity();
                return;
            }

            await enviarLeadCrm(e);
        });
    }
});

function aplicarMascaraTelefono() {
    const inputTelefono = document.getElementById('telefono');
    if (!inputTelefono) return;

    inputTelefono.addEventListener('input', (e) => {
        // Extraer solo dígitos numéricos y limitar a 10
        let value = e.target.value.replace(/\D/g, '').slice(0, 10);
        let formatted = '';

        if (value.length > 0) {
            if (value.length <= 3) {
                formatted = `(${value}`;
            } else if (value.length <= 6) {
                formatted = `(${value.slice(0, 3)}) ${value.slice(3)}`;
            } else {
                formatted = `(${value.slice(0, 3)}) ${value.slice(3, 6)}-${value.slice(6)}`;
            }
        }

        e.target.value = formatted;
    });
}

// Inicializar cuando el DOM esté listo
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', aplicarMascaraTelefono);
} else {
    aplicarMascaraTelefono();
}