/**
 * disclosure.js
 * @file jQuery Plugin zum Anreichern von vordefiniertem Markup mit Aus- bzw. Einklappfunktion
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
 *
 * - Das Plugin unterstützt eine Ausfahranimation via CSS-Transition der max-height Eigenschaft mit Berechnung und
 *   Setzen der ausgeklappten max-height, wenn die Option useInlineMaxHeight übergeben wird (default: false)
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
(function($) {
    'use strict';

    /**
     * Erzeuge Counter zur Erstellung eindeutiger IDs
     * @type {number}
     */
    var counter = 0;

    /**
     * wfDisclosure Plugin Definition
     * @param {Object} [options]
     */
    $.extend({
        wfDisclosure: function (options) {

            var defaults = {
                context: 'body',
                disclosure: '.js-disclosure',
                disclosureTeaser: '.js-disclosure__teaser',
                disclosurePanel: '.js-disclosure__panel',
                buttonStylingClass: 'wf-disclosure__button',
                buttonTextDisclose: 'mehr lesen',
                buttonTextHide: 'weniger lesen',
                animateMaxHeight: false
            };

            // Definiere sprachabhängige default Buttontexte
            if (document.documentElement.lang === 'en' || document.documentElement.lang === 'EN') {
                defaults.buttonTextDisclose = 'read more';
                defaults.buttonTextHide = 'show less';
            }

            // Erzeuge settings aus defaults und ggf. übergebenen Optionsparametern
            var settings = $.extend({}, defaults, options);

            var $context = $(settings.context);
            var $disclosures = $context.find(settings.disclosure);

            $disclosures.each(function (index, disclosure) {
                var $disclosure = $(disclosure);
                var $panel = $disclosure.find(settings.disclosurePanel);

                // Nutze custom Buttontext soweit definiert
                if ($disclosure.data('text-disclose')) {
                    settings.buttonTextDisclose = $disclosure.data('text-disclose');
                }

                if ($disclosure.data('text-hide')) {
                    settings.buttonTextHide = $disclosure.data('text-hide');
                }

                var $button = $('<button class="' + settings.buttonStylingClass + '">' + settings.buttonTextDisclose + '</button>');

                // Berechne und setze inline max-height Style für CSS Animation falls gewünscht
                if (settings.animateMaxHeight) {
                    var height = $panel.outerHeight();
                    $panel.css('max-height', height);
                }

                // Enhance Trigger und Panel mit a11y Attributen
                $button.attr('aria-expanded', false);
                $panel.attr('aria-hidden', true);

                // Erzeuge eindeutige IDs für a11y Beziehung
                var buttonId = 'disclosure-' + counter + '__teaser-' + index;
                var panelId = 'disclosure-' + counter + '__panel-' + index;

                // Erzeuge a11y Beziehungen zwischen Header und Panel
                $button.attr('aria-controls', panelId);
                $panel.attr('id', panelId);

                $button.attr('id', buttonId);
                $panel.attr('aria-labelledby', buttonId);

                // Setze Button ins DOM ein
                $disclosure.append($button);

                // Aktualisiere ARIA states bei Klick/Tap
                $button.on('click', function (event) {
                    var $target = $(event.target);
                    var state = $target.attr('aria-expanded') === 'false';

                    $target.attr('aria-expanded', state);
                    $('#' + $target.attr('aria-controls')).attr('aria-hidden', !state);
                    if (state) {
                        $target.text(settings.buttonTextHide);
                    } else {
                        $target.text(settings.buttonTextDisclose);
                    }
                });
            });

            // Jeder Aufruf des Plugins erhöht den Counter
            counter++;
        }
    });
    
})(jQuery);
