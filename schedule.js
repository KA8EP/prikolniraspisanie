const daysOfWeek = ["ПОНЕДЕЛЬНИК", "ВТОРНИК", "СРЕДА", "ЧЕТВЕРГ", "ПЯТНИЦА", "СУББОТА"];
const content = document.getElementById('content');

// Получаем параметры URL
const params = new URLSearchParams(window.location.search);
const courseId = params.get('course') || '1';
const groupId = params.get('group');

let courseData = null;

// Загрузка данных курса
async function loadCourse() {
    try {
        const res = await fetch(`data/course${courseId}.json`);
        if (!res.ok) throw new Error('Нет данных');
        courseData = await res.json();
        
        if (groupId) {
            renderSchedule(groupId);
        } else {
            renderGroupList();
        }
    } catch (err) {
        content.innerHTML = `<div class="error">Ошибка загрузки данных: ${err.message}</div>`;
    }
}

// Список групп
function renderGroupList() {
    const groups = Object.keys(courseData.groups);
    
    let html = `
        <h2 class="page-title">${courseData.title} — выберите группу</h2>
        <div class="groups-list">
    `;
    
    groups.forEach(g => {
        const group = courseData.groups[g];
        html += `
            <a href="schedule.html?course=${courseId}&group=${g}" class="group-btn">
                <div>
                    <div class="group-name">${g}</div>
                    <div class="group-desc">${group.description || ''}</div>
                </div>
                <span class="arrow">→</span>
            </a>
        `;
    });
    
    html += `</div>`;
    content.innerHTML = html;
}

// Расписание группы
function renderSchedule(groupKey) {
    const group = courseData.groups[groupKey];
    if (!group) {
        content.innerHTML = `<div class="error">Группа ${groupKey} не найдена</div>`;
        return;
    }

    let html = `
        <h2 class="group-title">Группа ${groupKey} (${courseData.title})</h2>
        <div class="group-subtitle">${group.description || ''}</div>
    `;

    let hasAny = false;

    daysOfWeek.forEach(day => {
        const lessons = group.schedule[day];
        if (!lessons || lessons.length === 0) return;
        
        hasAny = true;
        html += `<div class="day-card"><h3 class="day-title">${day}</h3>`;

        lessons.forEach(lesson => {
            const typeStr = lesson.type ? `<span>${lesson.type}:</span> ` : '';
            const roomStr = lesson.room 
                ? `<div class="detail-item">🚪 <span class="room-badge">${lesson.room}</span></div>` 
                : '';
            const teacherStr = lesson.teacher 
                ? `<div class="detail-item">👤 ${lesson.teacher}</div>` 
                : '';

            html += `
                <div class="lesson">
                    <div class="lesson-time">${lesson.time}</div>
                    <div class="lesson-info">
                        <div class="lesson-subject">${typeStr}${lesson.subject}</div>
                        <div class="lesson-details">
                            ${teacherStr}
                            ${roomStr}
                        </div>
                    </div>
                </div>
            `;
        });

        html += `</div>`;
    });

    if (!hasAny) {
        html += `<div class="no-lessons">Занятий нет.</div>`;
    }

    content.innerHTML = html;
}

loadCourse();