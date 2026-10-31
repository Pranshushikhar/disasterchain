const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, '../frontend/src/pages/ModernAcademyPage.jsx');
let content = fs.readFileSync(filePath, 'utf8');

const target = `            </div>
          </div>
        )}
                      <span className="dc-course-duration">
                        <Clock size={13} />
                        {course.duration}
                      </span>
                    </div>

                    <h3 className="dc-course-card-title">{course.title}</h3>
                    <p className="dc-course-card-desc">{course.description}</p>

                    <div className="dc-course-card-progress">
                      <div className="dc-progress-labels-compact">
                        <span>{completedLessons} / {course.lessons.length} Lessons</span>
                        <span>{isCompleted ? '100% Completed' : \`\${percent}%\`}</span>
                      </div>
                      <div className="dc-progress-track-compact">
                        <div
                          className={\`dc-progress-fill-compact \${isCompleted ? 'complete' : ''}\`}
                          style={{ width: isCompleted ? '100%' : \`\${percent}%\` }}
                        />
                      </div>
                    </div>

                    <div className="dc-course-card-footer">
                      <div className="dc-course-points-tag">
                        <Award size={14} />
                        <span>+{course.points} XP</span>
                      </div>

                      <Link
                        to={\`/academy/course/\${course.id}\`}
                        className={\`dc-btn \${isCompleted ? 'dc-btn-outline' : 'dc-btn-primary'} dc-course-action-btn\`}
                      >
                        {isCompleted ? 'Review Course' : completedLessons > 0 ? 'Continue' : 'Start Course'}
                      </Link>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}

        {/* TAB 2: SIMULATIONS SHOWCASE */}`;

const replacement = `            </div>
          </div>
        )}

        {/* TAB 2: SIMULATIONS SHOWCASE */}`;

// Normalize newlines
content = content.replace(/\r\n/g, '\n');
const normalizedTarget = target.replace(/\r\n/g, '\n');

if (content.includes(normalizedTarget)) {
  content = content.replace(normalizedTarget, replacement);
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('ModernAcademyPage.jsx syntax error fixed!');
} else {
  console.error('Target not found in ModernAcademyPage.jsx');
}

