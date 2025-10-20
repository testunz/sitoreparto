const storageKeys = {
    board: 'mi-board-items',
    procedures: 'mi-procedures',
    forms: 'mi-forms',
    guidelines: 'mi-guidelines' // stored without file blob reference
};

const authConfig = {
    storageKey: 'mi-authenticated',
    userKey: 'mi-auth-user',
    users: [
        {
            email: 'medicina@soverato.local',
            password: 'Reparto2024!',
            label: 'Medicina Interna'
        },
        {
            email: 'coordinamento@soverato.local',
            password: 'Turni2024!',
            label: 'Coordinamento Infermieristico'
        }
    ]
};

const defaultData = {
    board: [
        {
            title: 'Aggiornamento turni infermieristici',
            message: 'Dal 12 giugno il turno notturno prevede il supporto dell’unità di terapia sub-intensiva. Controllare il nuovo planning in intranet.',
            attachment: '#',
            createdAt: '2024-06-07T07:45:00Z',
            tag: 'Organizzazione'
        },
        {
            title: 'Reminder: Riunione multidisciplinare',
            message: 'Mercoledì 14 giugno ore 13:00 in sala briefing. Focus su gestione paziente con scompenso cardiaco.',
            attachment: '',
            createdAt: '2024-06-06T10:15:00Z',
            tag: 'Formazione'
        }
    ],
    guidelines: [
        {
            title: 'Gestione paziente con insufficienza respiratoria acuta',
            description: 'Protocollo aggiornato 2024 con algoritmo decisionale e parametri di monitoraggio.',
            href: '#',
            size: '1.8 MB · PDF'
        },
        {
            title: 'Profilassi antibiotica in reparto',
            description: 'Linee guida per profilassi antibiotica perioperatoria e gestione delle resistenze.',
            href: '#',
            size: '980 KB · PDF'
        }
    ],
    procedures: [
        {
            title: 'Percorso paziente sospetto sepsi',
            category: 'Emergenza',
            summary: 'Azioni prioritarie nelle prime due ore dal sospetto clinico.',
            details: '1. Attivazione codice sepsi tramite centrale operativa.\n2. Prelievi ematici e emocolture prima della terapia.\n3. Somministrazione antibiotico empirico secondo protocollo.\n4. Rivalutazione parametri vitale ogni 15 minuti.',
            createdAt: '2024-05-30T08:00:00Z'
        },
        {
            title: 'Transizione da terapia endovenosa a orale',
            category: 'Terapia',
            summary: 'Criteri per la conversione sicura del trattamento.',
            details: 'Valutare stabilità clinica, funzionalità gastrointestinale, disponibilità del farmaco per os e aderenza prevista. Coinvolgere il farmacista clinico per dosaggi personalizzati.',
            createdAt: '2024-04-12T08:00:00Z'
        }
    ],
    forms: [
        {
            title: 'Scheda raccolta dati ammissione',
            category: 'Amministrazione',
            description: 'Modulo per l’accoglienza del paziente e la raccolta dei consensi.',
            href: '#',
            filename: 'scheda_ammissione.pdf'
        },
        {
            title: 'Checklist dimissione protetta',
            category: 'Dimissioni',
            description: 'Percorso di accompagnamento per pazienti fragili in dimissione.',
            href: '#',
            filename: 'checklist_dimissione.pdf'
        },
        {
            title: 'Richiesta consulenza specialistica',
            category: 'Clinica',
            description: 'Modulo standard per richiesta visita specialistica in intraospedaliero.',
            href: '#',
            filename: 'richiesta_consulenza.docx'
        }
    ],
    links: [
        {
            label: 'Intranet Azienda Sanitaria',
            href: '#',
            description: 'Portale servizi interni, segnalazione guasti e richieste materiali.'
        },
        {
            label: 'Foglio turni condiviso',
            href: '#',
            description: 'Calendario aggiornato turnistica équipe medica e infermieristica.'
        },
        {
            label: 'Sistema segnalazione eventi avversi',
            href: '#',
            description: 'Accesso diretto alla piattaforma regionale di incident reporting.'
        }
    ],
    numbers: {
        department: [
            { label: 'Coordinatore infermieristico', value: '0967 531245' },
            { label: 'Medico di guardia', value: 'Interno 3421' },
            { label: 'Responsabile reparto', value: 'Interno 3400' }
        ],
        hospital: [
            { label: 'Radiologia', value: 'Interno 2260' },
            { label: 'Laboratorio analisi', value: 'Interno 2198' },
            { label: 'Servizio trasfusionale', value: 'Interno 2350' },
            { label: 'Farmacia ospedaliera', value: 'Interno 2284' }
        ]
    }
};

const state = {
    boardItems: [],
    guidelineItems: [],
    procedureItems: [],
    formItems: [],
    formFilter: 'Tutte',
    search: {
        guidelines: '',
        procedures: '',
        numbers: ''
    }
};

const dom = {};

document.addEventListener('DOMContentLoaded', () => {
    const page = document.body.dataset.page || 'home';
    cacheDom();
    enforceAuth(page);
    setupNavigation();
    hydrateState();

    if (page !== 'login') {
        renderAll();
        bindForms();
        bindSearch();
        updateUserBadge();
    }

    bindAuth();
    if (page !== 'login') {
        updateFooter();
    }
});

function cacheDom() {
    dom.boardList = document.querySelector('#board-list');
    dom.boardForm = document.querySelector('#board-form');
    dom.guidelinesList = document.querySelector('#guidelines-list');
    dom.guidelinesForm = document.querySelector('#guidelines-form');
    dom.procedureList = document.querySelector('#procedure-list');
    dom.procedureForm = document.querySelector('#procedure-form');
    dom.formsGrid = document.querySelector('#forms-grid');
    dom.formsForm = document.querySelector('#forms-form');
    dom.formsFilter = document.querySelector('#forms-filter');
    dom.linksList = document.querySelector('#links-list');
    dom.numbersDepartment = document.querySelector('#numbers-department');
    dom.numbersHospital = document.querySelector('#numbers-hospital');
    dom.lastUpdate = document.querySelector('#last-update');
    dom.guidelinesSearch = document.querySelector('#guidelines-search');
    dom.proceduresSearch = document.querySelector('#procedures-search');
    dom.numbersSearch = document.querySelector('#numbers-search');
    dom.loginForm = document.querySelector('#login-form');
    dom.loginError = document.querySelector('#login-error');
    dom.logoutButtons = document.querySelectorAll('[data-action="logout"]');
    dom.userBadge = document.querySelector('#user-badge');
}

function setupNavigation() {
    const nav = document.querySelector('.nav');
    const toggle = document.querySelector('.nav__toggle');
    if (!nav || !toggle) return;

    toggle.addEventListener('click', () => {
        const isOpen = nav.classList.toggle('is-open');
        toggle.setAttribute('aria-expanded', String(isOpen));
    });

    nav.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            nav.classList.remove('is-open');
            toggle.setAttribute('aria-expanded', 'false');
        });
    });
}

function enforceAuth(page) {
    if (page === 'login') {
        if (isAuthenticated()) {
            window.location.replace('home.html');
        }
        return;
    }

    if (!isAuthenticated()) {
        window.location.replace('index.html');
    }
}

function isAuthenticated() {
    return localStorage.getItem(authConfig.storageKey) === 'true';
}

function setAuthenticated(user) {
    localStorage.setItem(authConfig.storageKey, 'true');
    const payload = { email: user.email, label: user.label };
    localStorage.setItem(authConfig.userKey, JSON.stringify(payload));
}

function clearAuthentication() {
    localStorage.removeItem(authConfig.storageKey);
    localStorage.removeItem(authConfig.userKey);
}

function getCurrentUser() {
    try {
        const raw = localStorage.getItem(authConfig.userKey);
        return raw ? JSON.parse(raw) : null;
    } catch (error) {
        console.warn('Impossibile leggere dati utente', error);
        return null;
    }
}

function hydrateState() {
    state.boardItems = loadFromStorage(storageKeys.board, defaultData.board);
    state.guidelineItems = loadFromStorage(storageKeys.guidelines, defaultData.guidelines);
    state.procedureItems = loadFromStorage(storageKeys.procedures, defaultData.procedures);
    state.formItems = loadFromStorage(storageKeys.forms, defaultData.forms);
}

function renderAll() {
    renderBoard();
    renderGuidelines();
    renderProcedures();
    renderForms();
    renderLinks();
    renderNumbers();
}

function renderBoard() {
    if (!dom.boardList) return;
    dom.boardList.innerHTML = '';

    state.boardItems
        .sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt))
        .forEach(item => {
            const li = document.createElement('li');
            li.className = 'board__item';
            li.innerHTML = `
                <div class="board__meta">
                    <span class="badge">${item.tag || 'Comunicazione'}</span>
                    <time datetime="${item.createdAt}">
                        ${formatDate(item.createdAt)}
                    </time>
                </div>
                <h3>${sanitize(item.title)}</h3>
                <p>${sanitize(item.message)}</p>
                ${item.attachment ? renderAttachment(item.attachment) : ''}
            `;
            dom.boardList.appendChild(li);
        });
}

function renderAttachment(attachment) {
    if (attachment.startsWith('blob:') || attachment.startsWith('http')) {
        return `<a class="btn btn--ghost" href="${attachment}" target="_blank" rel="noopener">Apri allegato</a>`;
    }
    return `<span class="badge">Allegato disponibile in reparto</span>`;
}

function renderGuidelines() {
    if (!dom.guidelinesList) return;
    dom.guidelinesList.innerHTML = '';

    const query = state.search.guidelines.trim().toLowerCase();
    const filtered = state.guidelineItems.filter(item => {
        if (!query) return true;
        const haystack = [
            item.title,
            item.description,
            item.size
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(query);
    });

    if (filtered.length === 0) {
        const empty = document.createElement('li');
        empty.className = 'empty-state';
        empty.textContent = 'Nessuna linea guida trovata.';
        dom.guidelinesList.appendChild(empty);
        return;
    }

    filtered.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <p class="list__title">${sanitize(item.title)}</p>
                <p>${sanitize(item.description)}</p>
            </div>
            <div class="list__meta">${item.size ? sanitize(item.size) : ''}</div>
            <div>
                <a class="btn btn--ghost" href="${item.href || '#'}" target="_blank" rel="noopener">
                    Scarica documento
                </a>
            </div>
        `;
        dom.guidelinesList.appendChild(li);
    });
}

function renderProcedures() {
    if (!dom.procedureList) return;
    dom.procedureList.innerHTML = '';

    const query = state.search.procedures.trim().toLowerCase();
    const sorted = [...state.procedureItems].sort(
        (a, b) => new Date(b.createdAt || Date.now()) - new Date(a.createdAt || Date.now())
    );
    const filtered = sorted.filter(item => {
        if (!query) return true;
        const haystack = [
            item.title,
            item.category,
            item.summary,
            item.details
        ].filter(Boolean).join(' ').toLowerCase();
        return haystack.includes(query);
    });

    if (filtered.length === 0) {
        const empty = document.createElement('div');
        empty.className = 'empty-state';
        empty.textContent = 'Nessuna procedura corrisponde alla ricerca.';
        dom.procedureList.appendChild(empty);
        return;
    }

    filtered.forEach((item, index) => {
        const wrapper = document.createElement('article');
        wrapper.className = 'accordion__item';
        if (index === 0) wrapper.classList.add('is-open');

        const openId = `procedure-${index}`;
        wrapper.innerHTML = `
            <button class="accordion__button" aria-expanded="${index === 0}" aria-controls="${openId}">
                <span>${sanitize(item.title)}</span>
                <span class="accordion__tag">${sanitize(item.category)}</span>
            </button>
            <div id="${openId}" class="accordion__content" role="region">
                <p>${sanitize(item.summary)}</p>
                <pre>${sanitize(item.details)}</pre>
            </div>
        `;

        wrapper.querySelector('.accordion__button').addEventListener('click', evt => {
            const expanded = wrapper.classList.toggle('is-open');
            evt.currentTarget.setAttribute('aria-expanded', String(expanded));
        });

        dom.procedureList.appendChild(wrapper);
    });
}

function renderForms() {
    if (!dom.formsGrid || !dom.formsFilter) return;

    const categories = ['Tutte', ...new Set(state.formItems.map(item => item.category))];
    dom.formsFilter.innerHTML = '';

    categories.forEach(category => {
        const chip = document.createElement('button');
        chip.type = 'button';
        chip.className = `chip${category === state.formFilter ? ' is-active' : ''}`;
        chip.textContent = category;
        chip.addEventListener('click', () => {
            state.formFilter = category;
            renderForms();
        });
        dom.formsFilter.appendChild(chip);
    });

    dom.formsGrid.innerHTML = '';
    state.formItems
        .filter(item => state.formFilter === 'Tutte' || item.category === state.formFilter)
        .forEach(item => {
            const card = document.createElement('div');
            card.className = 'form-card';
            card.innerHTML = `
                <div>
                    <span class="badge">${sanitize(item.category)}</span>
                    <h4>${sanitize(item.title)}</h4>
                </div>
                <p>${sanitize(item.description)}</p>
                <a href="${item.href || '#'}" target="_blank" rel="noopener">
                    Scarica ${sanitize(item.filename || 'file')}
                </a>
            `;
            dom.formsGrid.appendChild(card);
        });
}

function renderLinks() {
    if (!dom.linksList) return;
    dom.linksList.innerHTML = '';

    defaultData.links.forEach(item => {
        const li = document.createElement('li');
        li.innerHTML = `
            <div>
                <a href="${item.href}" target="_blank" rel="noopener">${sanitize(item.label)}</a>
                <p>${sanitize(item.description)}</p>
            </div>
            <span class="badge">Esterno</span>
        `;
        dom.linksList.appendChild(li);
    });
}

function renderNumbers() {
    const query = state.search.numbers.trim().toLowerCase();
    const matcher = item => {
        if (!query) return true;
        return [item.label, item.value]
            .filter(Boolean)
            .join(' ')
            .toLowerCase()
            .includes(query);
    };

    if (dom.numbersDepartment) {
        const departmentItems = defaultData.numbers.department.filter(matcher);
        renderContactList(dom.numbersDepartment, departmentItems, 'Nessun contatto reparto trovato.');
    }

    if (dom.numbersHospital) {
        const hospitalItems = defaultData.numbers.hospital.filter(matcher);
        renderContactList(dom.numbersHospital, hospitalItems, 'Nessun numero ospedaliero trovato.');
    }
}

function buildContactItem(item) {
    const li = document.createElement('li');
    li.innerHTML = `
        <span class="contact__label">${sanitize(item.label)}</span>
        <span class="contact__value">${sanitize(item.value)}</span>
    `;
    return li;
}

function renderContactList(container, items, emptyMessage) {
    container.innerHTML = '';
    if (!items.length) {
        const empty = document.createElement('li');
        empty.className = 'empty-state';
        empty.textContent = emptyMessage;
        container.appendChild(empty);
        return;
    }

    items.forEach(item => {
        container.appendChild(buildContactItem(item));
    });
}

function bindSearch() {
    dom.guidelinesSearch?.addEventListener('input', event => {
        state.search.guidelines = event.target.value;
        renderGuidelines();
    });

    dom.proceduresSearch?.addEventListener('input', event => {
        state.search.procedures = event.target.value;
        renderProcedures();
    });

    dom.numbersSearch?.addEventListener('input', event => {
        state.search.numbers = event.target.value;
        renderNumbers();
    });
}

function bindAuth() {
    if (dom.loginForm) {
        dom.loginForm.addEventListener('submit', handleLogin);
        dom.loginForm.querySelectorAll('input').forEach(input => {
            input.addEventListener('input', clearLoginError);
        });
    }

    Array.from(dom.logoutButtons || []).forEach(button => {
        button.addEventListener('click', handleLogout);
    });
}

function bindForms() {
    dom.boardForm?.addEventListener('submit', handleBoardSubmit);
    dom.guidelinesForm?.addEventListener('submit', handleGuidelineSubmit);
    dom.procedureForm?.addEventListener('submit', handleProcedureSubmit);
    dom.formsForm?.addEventListener('submit', handleFormSubmit);
}

function handleLogin(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const email = String(formData.get('email') || '').trim().toLowerCase();
    const password = String(formData.get('password') || '').trim();

    const match = authConfig.users.find(user => {
        return user.email.toLowerCase() === email && user.password === password;
    });

    if (!match) {
        showLoginError('Credenziali non valide. Controlla email e password e riprova.');
        return;
    }

    setAuthenticated(match);
    clearLoginError();
    event.target.reset();
    window.location.replace('home.html');
}

function handleLogout(event) {
    event.preventDefault();
    clearAuthentication();
    window.location.replace('index.html');
}

function showLoginError(message) {
    if (!dom.loginError) return;
    dom.loginError.textContent = message;
    dom.loginError.hidden = false;
}

function clearLoginError() {
    if (!dom.loginError) return;
    dom.loginError.hidden = true;
    dom.loginError.textContent = '';
}

function handleBoardSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const newEntry = {
        title: formData.get('title'),
        message: formData.get('message'),
        attachment: formData.get('attachment'),
        createdAt: new Date().toISOString(),
        tag: 'Comunicazione'
    };

    state.boardItems.push(newEntry);
    saveToStorage(storageKeys.board, state.boardItems);
    renderBoard();
    event.target.reset();
}

function handleGuidelineSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const file = formData.get('file');

    const guideline = {
        title: formData.get('title'),
        description: formData.get('description'),
        href: file instanceof File ? URL.createObjectURL(file) : '#',
        size: file instanceof File ? formatFileSize(file.size, file.name) : ''
    };

    state.guidelineItems.unshift(guideline);
    saveToStorage(storageKeys.guidelines, state.guidelineItems);
    renderGuidelines();
    event.target.reset();
}

function handleProcedureSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const procedure = {
        title: formData.get('title'),
        category: formData.get('category'),
        summary: formData.get('summary'),
        details: formData.get('details'),
        createdAt: new Date().toISOString()
    };

    state.procedureItems.push(procedure);
    saveToStorage(storageKeys.procedures, state.procedureItems);
    renderProcedures();
    event.target.reset();
}

function handleFormSubmit(event) {
    event.preventDefault();
    const formData = new FormData(event.target);
    const file = formData.get('file');

    const formItem = {
        title: formData.get('title'),
        category: formData.get('category'),
        description: formData.get('description'),
        filename: file instanceof File ? file.name : 'documento',
        href: file instanceof File ? URL.createObjectURL(file) : '#'
    };

    state.formItems.unshift(formItem);
    saveToStorage(storageKeys.forms, state.formItems);
    renderForms();
    event.target.reset();
}

function updateFooter() {
    if (!dom.lastUpdate) return;
    dom.lastUpdate.textContent = formatDate(new Date().toISOString());
}

function updateUserBadge() {
    if (!dom.userBadge) return;
    const user = getCurrentUser();
    if (!user) {
        dom.userBadge.hidden = true;
        return;
    }

    dom.userBadge.hidden = false;
    dom.userBadge.textContent = user.label || user.email;
    dom.userBadge.title = user.email;
}

function loadFromStorage(key, fallback) {
    try {
        const raw = localStorage.getItem(key);
        if (!raw) return [...fallback];
        return JSON.parse(raw);
    } catch (error) {
        console.warn(`Impossibile leggere ${key}`, error);
        return [...fallback];
    }
}

function saveToStorage(key, value) {
    try {
        localStorage.setItem(key, JSON.stringify(value));
    } catch (error) {
        console.warn(`Impossibile salvare ${key}`, error);
    }
}

function sanitize(value) {
    if (!value) return '';
    return String(value)
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&#39;');
}

function formatDate(isoDate) {
    try {
        return new Intl.DateTimeFormat('it-IT', {
            day: '2-digit',
            month: 'long',
            year: 'numeric'
        }).format(new Date(isoDate));
    } catch {
        return isoDate;
    }
}

function formatFileSize(bytes, name = '') {
    if (!Number.isFinite(bytes)) return name;
    const mb = bytes / (1024 * 1024);
    if (mb >= 1) {
        return `${name} · ${mb.toFixed(1)} MB`;
    }
    return `${name} · ${(bytes / 1024).toFixed(0)} KB`;
}
