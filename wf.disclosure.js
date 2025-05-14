/**
 * wf.disclosure.js
 * @file Plugin zum Anreichern von vordefiniertem Markup mit Aus- bzw. Einklappfunktion
 * (barrierearm und inkl. Tastaturunterstützung)
 *
 * @example Benötigtes HTML:
 * <div class="wf-disclosure js-disclosure">
 *     <div class="wf-disclosure__teaser js-disclosure__teaser">Teasertext</div>
 *     <div class="wf-disclosure__panel js-disclosure__panel">Text</div>
 * </div>
 *
 * Anmerkungen:
 * - Die Styling- und JS-Hook-Klassen sind frei wählbar, letztere (.js-*) müssen allerdings an das Plugin via Options
 *   übergeben werden, sobald sie von den Namen im Beispiel abweichen.
 * - eigene Button-Texte können in Templates via data-Attribut übergeben werden, z.B. so:
 *   <div class="wf-disclosure js-disclosure" data-text-disclose="{{ 'akkordeon.mehrLesen'|trans|striptags }}" data-text-hide="{{ 'akkordeon.wenigerLesen' |trans|striptags }}">
 *   Wichtig: in mehrsprachigen Projekten am besten mit Messages arbeiten!
 * - die Position des Buttons (vor oder nach dem ausklappenden Panel) kann via `data-button-position-below` als boolean übergeben werden.
 * - Das Plugin unterstützt eine Ausfahranimation via CSS-Transition der max-height Eigenschaft mit Berechnung und
 *   Setzen der ausgeklappten max-height, wenn die Option useInlineMaxHeight übergeben wird (default: false)
 * - ESM import mit `import {wfDisclosure} from "webfactory-disclosure/wf.disclosure";`
 *
 *   Ein Beispiel SCSS-Snippet für diese Animation:
 *
 *   .wf-disclosure__panel {
 *       opacity: 1;
 *       overflow: hidden;
 *       transition:
 *          max-height 0.2s ease-in-out 0s,
 *          opacity 0.2s ease 0s,
 *          visibility 0.1s ease 0.1s;
 *       visibility: visible;
 *
 *       .js & {
 *           &[aria-hidden=true] {
 *              max-height: 0 !important;
 *              opacity: 0;
 *              visibility: hidden;
 *           }
 *       }
 *   }
 *
 * Unterstützte Tastatureingaben:
 * - Die vom Plugin erzeugten Button-Elemente folgen der normalen Tab ⇥ Reihenfolge
 * - Die Buttons reagieren auf Leertaste und Enter ↵, um ein Panel zu öffnen bzw. zu schließen
 */
let counter = 0;

export function wfDisclosure(options = {}) {
    const defaults = {
        context: 'body',
        disclosure: '.js-disclosure',
        disclosureTeaser: '.js-disclosure__teaser',
        disclosurePanel: '.js-disclosure__panel',
        buttonStylingClass: 'wf-disclosure__button',
        buttonTextDisclose: 'mehr lesen',
        buttonTextHide: 'weniger lesen',
        buttonPositionBelow: false, // Danger Zone: probable failure of WCAG 1.3.2 and 3.2.2 if the trigger is positioned below the disclosed content
        animateMaxHeight: false
    };

    if (document.documentElement.lang === 'en' || document.documentElement.lang === 'EN') {
        defaults.buttonTextDisclose = 'read more';
        defaults.buttonTextHide = 'show less';
    }

    const settings = { ...defaults, ...options };
    const rootElement = document.querySelector(settings.context);
    const disclosures = rootElement.querySelectorAll(settings.disclosure);

    disclosures.forEach((disclosure, index) => {
        const panel = disclosure.querySelector(settings.disclosurePanel);
        const teaser = disclosure.querySelector(settings.disclosureTeaser);

        // Use data attributes for custom text
        const textDisclose = disclosure.dataset.textDisclose || settings.buttonTextDisclose;
        const textHide = disclosure.dataset.textHide || settings.buttonTextHide;

        const button = document.createElement('button');
        button.type = 'button';
        button.className = settings.buttonStylingClass;
        button.textContent = textDisclose;
        button.setAttribute('aria-expanded', 'false');

        // Generate unique IDs
        const buttonId = `disclosure-${counter}__teaser-${index}`;
        const panelId = `disclosure-${counter}__panel-${index}`;

        button.id = buttonId;
        panel.id = panelId;
        panel.setAttribute('aria-hidden', 'true');
        panel.setAttribute('aria-labelledby', buttonId);
        button.setAttribute('aria-controls', panelId);

        // Handle animation
        if (settings.animateMaxHeight && panel.scrollHeight) {
            panel.style.maxHeight = `${panel.scrollHeight}px`;
        }

        // Insert button
        if (settings.buttonPositionBelow) {
            disclosure.appendChild(button);
        } else {
            panel.insertAdjacentElement('beforebegin', button);
        }

        // Click handler
        button.addEventListener('click', () => {
            const expanded = button.getAttribute('aria-expanded') === 'true';
            button.setAttribute('aria-expanded', !expanded);
            panel.setAttribute('aria-hidden', expanded);
            button.textContent = expanded ? textDisclose : textHide;

            // Optional animation handling
            if (settings.animateMaxHeight) {
                panel.style.maxHeight = expanded ? '0' : `${panel.scrollHeight}px`;
            }
        });
    });

    counter++;
}
