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
    if (modality.value === 'in-person') {
        console.log('In-person selected');
        show(locationGroup);
        hide(urlGroup);
        show(attendees);

    } else if (modality.value === 'remote') {
        console.log('Remote selected');
        show(urlGroup);
        hide(locationGroup);
        show(attendees);

    } else {
        console.log('No modality selected');
        hide(locationGroup);
        hide(urlGroup);
        hide(attendees);
    }
}

function saveEvent(){
    const eventDetails = {
        name: eventName.value,
        weekday: weekday.value,
        time: time.value,
        category: category.value,
        modality: modality.value,
        location: modality.value === 'in-person' ? locationInput.value : null,
        url: modality.value === 'remote' ? remoteUrlInput.value : null,
        attendees: attendeesInput.value
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
        currentEditingCard = null;
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
    
    currentEditingCard = null;
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