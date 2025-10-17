const modality = document.getElementById('event_modality');
const attendees = document.getElementById('attendees_group');
const locationGroup = document.getElementById('location_group');
const urlGroup = document.getElementById('remote_url_group');
const eventName = document.getElementById('event_name');
const weekday = document.getElementById('event_weekday');
const time = document.getElementById('event_time');
const category = document.getElementById('event_category');
const locationInput = document.getElementById('event_location');
const remoteUrlInput = document.getElementById('event_remote_url');
const attendeesInput = document.getElementById('event_attendees');
const eventForm = document.getElementById('event_form');

const eventModal = document.getElementById('eventModal');

let currentCard = null;

function show(el) { el.classList.remove('d-none'); }
function hide(el) { el.classList.add('d-none'); }

function getModalInstance() {
    if (!eventModal) {
        return null;
    }

    return bootstrap.Modal.getOrCreateInstance(eventModal);
}

function updateLocationOptions() {
    const modalityValue = modality.value;

    if (modalityValue === 'in-person') {
        console.log('In-person selected');
        show(locationGroup);
        hide(urlGroup);
        show(attendees);
        locationInput.required = true;
        locationInput.setCustomValidity('');
        remoteUrlInput.required = false;
        remoteUrlInput.value = '';
        remoteUrlInput.setCustomValidity('');

    } else if (modalityValue === 'remote') {
        console.log('Remote selected');
        show(urlGroup);
        hide(locationGroup);
        show(attendees);
        remoteUrlInput.required = true;
        remoteUrlInput.setCustomValidity('');
        locationInput.required = false;
        locationInput.value = '';
        locationInput.setCustomValidity('');
    } else {
        console.log('No modality selected');
        hide(locationGroup);
        hide(urlGroup);
        hide(attendees);
        locationInput.required = false;
        remoteUrlInput.required = false;
        locationInput.value = '';
        remoteUrlInput.value = '';
        locationInput.setCustomValidity('');
        remoteUrlInput.setCustomValidity('');
    }
}

function validateEventForm() {
    if (!eventForm) {
        return true;
    }

    const trimmedName = eventName.value.trim();
    if (!trimmedName) {
        eventName.setCustomValidity('Please enter an event name.');
    } else {
        eventName.setCustomValidity('');
    }

    if (!weekday.value) {
        weekday.setCustomValidity('Select a day for the event.');
    } else {
        weekday.setCustomValidity('');
    }

    if (!time.value) {
        time.setCustomValidity('Select a time for the event.');
    } else {
        time.setCustomValidity('');
    }

    if (!category.value) {
        category.setCustomValidity('Select a category for the event.');
    } else {
        category.setCustomValidity('');
    }

    if (!modality.value) {
        modality.setCustomValidity('Select how you will attend the event.');
    } else {
        modality.setCustomValidity('');
    }

    if (modality.value === 'in-person') {
        const locationValue = locationInput.value.trim();
        if (!locationValue) {
            locationInput.setCustomValidity('Provide a location for in-person events.');
        } else {
            locationInput.setCustomValidity('');
        }
    }

    if (modality.value === 'remote') {
        const remoteValue = remoteUrlInput.value.trim();
        if (!remoteValue) {
            remoteUrlInput.setCustomValidity('Provide the meeting link for remote events.');
        } else if (!/^https?:\/\/.+/i.test(remoteValue)) {
            remoteUrlInput.setCustomValidity('Enter a valid URL that starts with http or https.');
        } else {
            remoteUrlInput.setCustomValidity('');
        }
    }

    const isValid = eventForm.checkValidity();
    if (!isValid) {
        eventForm.reportValidity();
    }
    return isValid;
}

function saveEvent(){
    const eventDetails = {
        name: eventName.value.trim(),
        weekday: weekday.value,
        time: time.value,
        category: category.value,
        modality: modality.value,
        location: modality.value === 'in-person' ? locationInput.value.trim() : null,
        url: modality.value === 'remote' ? remoteUrlInput.value.trim() : null,
        attendees: attendeesInput.value.trim()
    };
    if (currentCard) {
        console.log('Editing existing event:', eventDetails);
        editEventCard(currentCard, eventDetails);
    }
    else {
        console.log('Event Details:', eventDetails);
        addEventToCalendarUI(eventDetails);
    }
    const modalInstance = getModalInstance();
    if (modalInstance) {
        modalInstance.hide();
    }
}

function editEventCard(card, eventDetails) {
    if (!card) {
        console.error('No card selected for editing.');
        return;
    }
    const updatedCard = createEventCard(eventDetails);
    const newDayColumn = document.getElementById(eventDetails.weekday.toLowerCase());
    if (!newDayColumn) {
        console.error('Invalid weekday when editing event:', eventDetails.weekday);
        currentCard = null;
        return;
    }
    const currentParent = card.parentElement;
    if (currentParent && currentParent === newDayColumn) {
        currentParent.replaceChild(updatedCard, card);
    } else {
        if (currentParent) {
            currentParent.removeChild(card);
        }
        newDayColumn.appendChild(updatedCard);
    }
    
    currentCard = null;
    console.log('Editing event:', eventDetails);
}


function openEditModal(card, eventDetails) {
    if (!card || !eventDetails) {
        console.error('Card or event details missing for editing.');
        return;
    }
    eventName.value = eventDetails.name || '';
    weekday.value = eventDetails.weekday || '';
    time.value = eventDetails.time || '';
    modality.value = eventDetails.modality || '';
    category.value = eventDetails.category || '';
    
    currentCard = card;

    updateLocationOptions();
    if (modality.value === 'in-person') {
        locationInput.value = eventDetails.location || '';
        remoteUrlInput.value = '';
    } else if (modality.value === 'remote') {
        remoteUrlInput.value = eventDetails.url || '';
        locationInput.value = '';
    } else {
        locationInput.value = '';
        remoteUrlInput.value = '';
    }
    attendeesInput.value = eventDetails.attendees || '';
    
    const modalInstance = getModalInstance();
    if (modalInstance) {
        modalInstance.show();
    }
}

function getCategoryColor(){
    const selectedCategory = category.value;
    switch(selectedCategory) {
        case 'work': return 'lightyellow';
        case 'personal': return 'lightblue';
        case 'school': return 'lightgreen';
    }
}

function resetEventForm() {
    eventName.value = '';
    weekday.value = '';
    time.value = '';
    category.value = '';
    modality.value = '';
    
    attendeesInput.value = '';
    locationInput.value = '';
    remoteUrlInput.value = '';
    
    updateLocationOptions();
}

if (eventModal) {
    eventModal.addEventListener('hidden.bs.modal', resetEventForm);
}

if (eventForm) {
    eventForm.addEventListener('submit', (evt) => {
        evt.preventDefault();
        if (!validateEventForm()) {
            return;
        }
        saveEvent();
    });
}

[eventName, locationInput, remoteUrlInput, attendeesInput].forEach((input) => {
    if (!input) {
        return;
    }
    input.addEventListener('input', () => input.setCustomValidity(''));
});

[weekday, category, modality].forEach((select) => {
    if (!select) {
        return;
    }
    select.addEventListener('change', () => select.setCustomValidity(''));
});

if (modality) {
    modality.addEventListener('change', updateLocationOptions);
}

function addEventToCalendarUI(eventInfo) {
    const dayId = eventInfo.weekday.toLowerCase();
    const dayColumn = document.getElementById(dayId);
    if(!dayColumn) {
        console.error('Invalid weekday:', eventInfo.weekday);
        return;
    }
    const eventCard = createEventCard(eventInfo);
    dayColumn.appendChild(eventCard);
}

function createEventCard(eventDetails) {
    const card = document.createElement('div');
    card.classList.add('card', 'shadow-sm', 'mb-3');
    
    const bgColor = getCategoryColor();
    if (bgColor) {
        card.style.backgroundColor = bgColor;
    }

    const body = document.createElement('div');
    body.classList.add('card-body', 'p-3');
  
    // Event title
    const title = document.createElement('h5');
    title.classList.add('card-title', 'mb-2');
    title.textContent = eventDetails.name || '(Untitled Event)';
  
    // Time + modality badge
    const subtitle = document.createElement('h6');
    subtitle.classList.add('card-subtitle', 'mb-2', 'text-muted');
    subtitle.innerHTML = `
      <span class="me-2">
        <i class="bi bi-clock"></i> ${eventDetails.time || '--:--'}
      </span>
      <span class="badge bg-${eventDetails.modality === 'remote' ? 'info' : 'success'}">
        ${eventDetails.modality === 'remote' ? 'Remote' : 'In-Person'}
      </span>
    `;
  
    // Details: location/URL
    const details = document.createElement('p');
    details.classList.add('card-text', 'small', 'mt-2');
    if (eventDetails.modality === 'in-person' && eventDetails.location) {
      details.innerHTML = `<i class="bi bi-geo-alt"></i> ${eventDetails.location}`;
    } else if (eventDetails.modality === 'remote' && eventDetails.url) {
      details.innerHTML = `<i class="bi bi-camera-video"></i> 
        <a href="${eventDetails.url}" target="_blank" rel="noopener">Join Link</a>`;
    }
  
    // Attendees
    const attendees = document.createElement('p');
    attendees.classList.add('card-text', 'small', 'text-muted');
    if (eventDetails.attendees) {
      attendees.innerHTML = `<i class="bi bi-people"></i> ${eventDetails.attendees}`;
    }
  
    body.appendChild(title);
    body.appendChild(subtitle);
    if (details.textContent || details.innerHTML) body.appendChild(details);
    if (attendees.textContent || attendees.innerHTML) body.appendChild(attendees);
  
    card.appendChild(body);

    card.addEventListener('click', () => openEditModal(card, eventDetails));

    return card;
}
