const modality   = document.getElementById('event_modality');
const attendees  = document.getElementById('attendees_group');
const locationGroup = document.getElementById('location_group');
const urlGroup   = document.getElementById('remote_url_group');
const eventName  = document.getElementById('event_name');
const weekday    = document.getElementById('event_weekday');
const time       = document.getElementById('event_time');
const category   = document.getElementById('event_category');
function show(el) { el.classList.remove('d-none'); }
function hide(el) { el.classList.add('d-none'); }

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
        modality: modality.value,
        location: modality.value === 'in-person' ? document.getElementById('event_location').value : null,
        url: modality.value === 'remote' ? document.getElementById('event_remote_url').value : null,
        attendees: document.getElementById('event_attendees').value
    };
    console.log('Event Details:', eventDetails);
    addEventToCalendarUI(eventDetails);
    closeEventModal();
}

function addEventToCalendarUI(eventInfo) {
    // Placeholder function to simulate adding event to calendar
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

function openEditModal(card, eventDetails) {
    const modal = new bootstrap.Modal(document.getElementById('eventModal'));

    document.getElementById('event_name').value = eventDetails.name || '';
    document.getElementById('event_weekday').value = eventDetails.weekday || '';
    document.getElementById('event_time').value = eventDetails.time || '';
    document.getElementById('event_modality').value = eventDetails.modality || '';

    updateLocationOptions();
    if (eventDetails.modality === 'in-person') {
        document.getElementById('event_location').value = eventDetails.location || '';
    } else if (eventDetails.modality === 'remote') {
        document.getElementById('event_remote_url').value = eventDetails.url || '';
    }
    document.getElementById('event_attendees').value = eventDetails.attendees || '';
    document.getElementById('event_category').value = eventDetails.category || '';
    
    eventModal.show();
}

function getCategoryColor(){
    const selectedCategory = category.value;
    switch(selectedCategory) {
        case 'work': return 'lightyellow';
        case 'personal': return 'lightblue';
        case 'school': return 'lightgreen';
    }
}
function closeEventModal() {
    const eventModal = document.getElementById('eventModal');
    const modal = bootstrap.Modal.getInstance(eventModal);
    function resetForm() {
        document.getElementById('event_form').reset();
        updateLocationOptions();
    }
    modal.hide();
    resetForm();
}