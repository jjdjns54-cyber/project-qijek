import { useEffect, useMemo, useRef, useState, type KeyboardEvent, type PointerEvent } from "react";
import { createPortal } from "react-dom";
import { ArrowLeft, ArrowRight, Check, ChevronDown, Globe2, Mars, Minus, Plus, Search, Venus } from "lucide-react";
import Brand from "./Brand";

const frequencyOptions = [
  {
    value: "yes",
    label: "Yes",
  },
  {
    value: "no",
    label: "No",
  },
] as const;

type Frequency = (typeof frequencyOptions)[number]["value"];
type CandidateChoice = "a" | "b";
type SexReference = "female" | "male";
type Step = 1 | 2 | 3 | 4 | 5;

const countryCodes = "AD AE AF AG AI AL AM AO AQ AR AS AT AU AW AX AZ BA BB BD BE BF BG BH BI BJ BL BM BN BO BQ BR BS BT BV BW BY BZ CA CC CD CF CG CH CI CK CL CM CN CO CR CU CV CW CX CY CZ DE DJ DK DM DO DZ EC EE EG EH ER ES ET FI FJ FK FM FO FR GA GB GD GE GF GG GH GI GL GM GN GP GQ GR GS GT GU GW GY HK HM HN HR HT HU ID IE IL IM IN IO IQ IR IS IT JE JM JO JP KE KG KH KI KM KN KP KR KW KY KZ LA LB LC LI LK LR LS LT LU LV LY MA MC MD ME MF MG MH MK ML MM MN MO MP MQ MR MS MT MU MV MW MX MY MZ NA NC NE NF NG NI NL NO NP NR NU NZ OM PA PE PF PG PH PK PL PM PN PR PS PT PW PY QA RE RO RS RU RW SA SB SC SD SE SG SH SI SJ SK SL SM SN SO SR SS ST SV SX SY SZ TC TD TF TG TH TJ TK TL TM TN TO TR TT TV TW TZ UA UG UM US UY UZ VA VC VE VG VI VN VU WF WS YE YT ZA ZM ZW".split(" ");

const countryNames = new Intl.DisplayNames(["en"], { type: "region" });
const countries = countryCodes
  .map((code) => ({ code, name: countryNames.of(code) ?? code }))
  .sort((a, b) => a.name.localeCompare(b.name));

function CountryFlag({ code }: { code: string }) {
  const [loaded, setLoaded] = useState(false);
  const [failed, setFailed] = useState(false);

  return (
    <span className={`country-flag ${loaded ? "is-loaded" : ""}`} aria-hidden="true">
      <span>{code}</span>
      {!failed && (
        <img
          alt=""
          loading="eager"
          src={`https://flagcdn.com/w40/${code.toLocaleLowerCase()}.png`}
          onLoad={() => setLoaded(true)}
          onError={() => setFailed(true)}
        />
      )}
    </span>
  );
}

function detectCountry() {
  const zone = Intl.DateTimeFormat().resolvedOptions().timeZone;
  const timezoneCountry: Record<string, string> = {
    "Asia/Bangkok": "TH",
    "Asia/Tokyo": "JP",
    "Asia/Seoul": "KR",
    "Asia/Singapore": "SG",
    "Asia/Hong_Kong": "HK",
    "Asia/Jakarta": "ID",
    "Asia/Kuala_Lumpur": "MY",
    "Asia/Manila": "PH",
    "Asia/Ho_Chi_Minh": "VN",
    "Europe/London": "GB",
    "Australia/Sydney": "AU",
    "Pacific/Auckland": "NZ",
  };
  if (timezoneCountry[zone]) return timezoneCountry[zone];
  for (const language of navigator.languages) {
    const region = new Intl.Locale(language).region;
    if (region && countryCodes.includes(region)) return region;
  }
  return "";
}

export default function OnboardingPage() {
  const [step, setStep] = useState<Step>(1);
  const [frequency, setFrequency] = useState<Frequency | null>(null);
  const [candidate, setCandidate] = useState<CandidateChoice | null>(null);
  const [sexReference, setSexReference] = useState<SexReference | null>(null);
  const [age, setAge] = useState(18);
  const [isDraggingAge, setIsDraggingAge] = useState(false);
  const ageDrag = useRef<{ pointerId: number; startX: number; startAge: number; currentAge: number; stepWidth: number } | null>(null);
  const [birthCountry, setBirthCountry] = useState(() => detectCountry());
  const [countryQuery, setCountryQuery] = useState("");
  const [isCountryOpen, setIsCountryOpen] = useState(false);
  const countryPickerRef = useRef<HTMLDivElement>(null);
  const countryMenuRef = useRef<HTMLDivElement>(null);
  const countrySearchRef = useRef<HTMLInputElement>(null);
  const ageWindow = useMemo(
    () => [-2, -1, 0, 1, 2].map((offset) => Math.min(80, Math.max(15, age + offset))),
    [age],
  );
  const selectedCountry = countries.find((country) => country.code === birthCountry);
  const filteredCountries = useMemo(() => {
    const query = countryQuery.trim().toLocaleLowerCase();
    if (!query) return countries.slice(0, 10);
    return countries.filter((country) => country.name.toLocaleLowerCase().includes(query)).slice(0, 10);
  }, [countryQuery]);

  useEffect(() => {
    if (!isCountryOpen) return;
    const closeOnOutsideClick = (event: MouseEvent) => {
      if (event.target instanceof Element && event.target.closest(".country-menu__scrim")) return;
      if (
        !countryPickerRef.current?.contains(event.target as Node)
        && !countryMenuRef.current?.contains(event.target as Node)
      ) setIsCountryOpen(false);
    };
    document.addEventListener("pointerdown", closeOnOutsideClick);
    return () => document.removeEventListener("pointerdown", closeOnOutsideClick);
  }, [isCountryOpen]);

  useEffect(() => {
    requestAnimationFrame(() => {
      if (isCountryOpen && matchMedia("(min-width: 561px)").matches) {
        countrySearchRef.current?.focus({ preventScroll: true });
      }
      const page = countryPickerRef.current?.closest<HTMLElement>(".onboarding-page");
      if (page) page.scrollTop = 0;
    });
  }, [isCountryOpen]);

  const clampAge = (value: number) => Math.min(80, Math.max(15, value));

  const startAgeDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (event.pointerType === "mouse" && event.button !== 0) return;
    const numbers = event.currentTarget.querySelectorAll("span");
    const stepWidth = numbers.length > 1
      ? Math.abs(numbers[1].getBoundingClientRect().left - numbers[0].getBoundingClientRect().left)
      : 56;
    ageDrag.current = { pointerId: event.pointerId, startX: event.clientX, startAge: age, currentAge: age, stepWidth };
    event.currentTarget.setPointerCapture(event.pointerId);
    setIsDraggingAge(true);
  };

  const moveAgeDrag = (event: PointerEvent<HTMLDivElement>) => {
    const drag = ageDrag.current;
    if (!drag || drag.pointerId !== event.pointerId) return;
    const delta = event.clientX - drag.startX;
    const nextAge = clampAge(drag.startAge + Math.round(-delta / drag.stepWidth));
    const renderedSteps = nextAge - drag.startAge;
    const remainder = Math.max(-drag.stepWidth, Math.min(drag.stepWidth, delta + renderedSteps * drag.stepWidth));
    event.currentTarget.style.setProperty("--age-drag-x", `${remainder}px`);
    if (nextAge !== drag.currentAge) {
      drag.currentAge = nextAge;
      setAge(nextAge);
    }
  };

  const stopAgeDrag = (event: PointerEvent<HTMLDivElement>) => {
    if (ageDrag.current?.pointerId !== event.pointerId) return;
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId);
    }
    setIsDraggingAge(false);
    const wheel = event.currentTarget;
    requestAnimationFrame(() => wheel.style.setProperty("--age-drag-x", "0px"));
    ageDrag.current = null;
  };

  const handleAgeKey = (event: KeyboardEvent<HTMLDivElement>) => {
    const nextAge = {
      ArrowLeft: age - 1,
      ArrowDown: age - 1,
      ArrowRight: age + 1,
      ArrowUp: age + 1,
      Home: 15,
      End: 80,
    }[event.key];
    if (nextAge === undefined) return;
    event.preventDefault();
    setAge(clampAge(nextAge));
  };

  const finish = () => {
    sessionStorage.setItem(
      "doodee:onboarding",
      JSON.stringify({
        opportunityFrequency: frequency,
        candidateChoice: candidate,
        sexReference,
        age,
        birthCountry,
      }),
    );
    sessionStorage.removeItem("doodee:authenticated");
    window.location.assign("/login");
  };

  return (
    <main className="onboarding-page">
      <header className="onboarding-header">
        <Brand />
        <div className="onboarding-progress" aria-label={`Step ${step} of 5`}>
          <span>{step} of 5</span>
          <span className="onboarding-progress__track" aria-hidden="true">
            <span style={{ width: `${step * 20}%` }} />
          </span>
        </div>
      </header>

      <section className="onboarding-shell" aria-live="polite">
        {step === 1 ? (
          <div className={`onboarding-step ${frequency ? "onboarding-step--survey-result" : ""}`} key={frequency ? "question-one-result" : "question-one"}>
            {!frequency ? (
              <>
                <div className="onboarding-question onboarding-question--centered">
                  <p className="onboarding-label">First impressions</p>
                  <h1>Do good-looking people get treated better?</h1>
                  <p>Choose what you think.</p>
                </div>

                <div className="frequency-options frequency-options--binary" role="radiogroup" aria-label="Do good-looking people get treated better?">
                  {frequencyOptions.map((option) => (
                    <button
                      className="frequency-option frequency-option--binary"
                      key={option.value}
                      type="button"
                      role="radio"
                      aria-checked="false"
                      onClick={() => setFrequency(option.value)}
                    >
                      <span>{option.label}</span>
                      <span className="frequency-option__check" aria-hidden="true">
                        <Check size={15} />
                      </span>
                    </button>
                  ))}
                </div>
              </>
            ) : (
              <>
                <div className="survey-result-heading" role="status">
                  <p className="onboarding-label">What the research found</p>
                  <h1>
                    {frequency === "no"
                      ? "Most people disagree with you."
                      : "87% agree with you."}
                  </h1>
                  <p>
                    {frequency === "no"
                      ? "In a 2021 YouGov survey of adults in Great Britain:"
                      : <>In a 2021 YouGov survey, <strong>87% of adults said attractive people are treated better by others.</strong></>}
                  </p>
                </div>

                <figure className={`survey-result-chart ${frequency === "no" ? "survey-result-chart--minority" : ""}`} aria-label="87 percent said good-looking people are treated better while 13 percent gave another response or were unsure">
                  <div className="survey-result-chart__bar" aria-hidden="true">
                    <span className={frequency === "no" ? "survey-result-chart__other" : "survey-result-chart__yes"} />
                  </div>
                  <figcaption>
                    {frequency === "no" ? (
                      <span><strong>13%</strong><small>No / unsure</small></span>
                    ) : (
                      <span><strong>87%</strong><small>Yes</small></span>
                    )}
                  </figcaption>
                </figure>

                <div className="survey-result-copy">
                  <p>
                    {frequency === "no"
                      ? <><strong>87%</strong> believe good-looking people are treated more favourably. Only <strong>13%</strong> said otherwise or weren’t sure.</>
                      : <>That advantage can show up in things like <strong>first impressions, social interactions, and even work opportunities.</strong></>}
                  </p>
                  <div className="response-research__links">
                    <a href="https://yougov.com/en-gb/articles/35834-physical-appearance-todays-society" target="_blank" rel="noreferrer">
                      YouGov Body Image Study · Great Britain · 2021 <ArrowRight size={14} />
                    </a>
                    <a href="https://www.nber.org/papers/w4518" target="_blank" rel="noreferrer">
                      Beauty and the Labor Market · NBER <ArrowRight size={14} />
                    </a>
                  </div>
                </div>

                <div className="onboarding-actions onboarding-actions--end">
                  <button className="onboarding-primary" type="button" onClick={() => setStep(2)}>
                    Continue <ArrowRight size={17} />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : step === 2 ? (
          <div className={`onboarding-step ${candidate ? "onboarding-step--survey-result" : ""}`} key={candidate ? "question-two-result" : "question-two"}>
            {!candidate ? (
              <>
                <div className="onboarding-question onboarding-question--centered">
                  <p className="onboarding-label">A quick decision</p>
                  <h1>These two people have the same skills and experience. Who would you choose first?</h1>
                </div>

                <div className="candidate-grid" role="radiogroup" aria-label="Choose a candidate">
                  <button
                    className="candidate-option"
                    type="button"
                    role="radio"
                    aria-checked="false"
                    onClick={() => setCandidate("a")}
                  >
                    <span className="candidate-option__image">
                      <img src="/assets/candidate-right-glasses.png" alt="Candidate A" />
                      <span className="candidate-option__check"><Check size={16} /></span>
                    </span>
                    <span className="candidate-option__copy">
                      <strong>Person A</strong>
                      <span>Same skills · Same experience</span>
                    </span>
                  </button>

                  <button
                    className="candidate-option"
                    type="button"
                    role="radio"
                    aria-checked="false"
                    onClick={() => setCandidate("b")}
                  >
                    <span className="candidate-option__image">
                      <img src="/assets/candidate-left.png" alt="Candidate B" />
                      <span className="candidate-option__check"><Check size={16} /></span>
                    </span>
                    <span className="candidate-option__copy">
                      <strong>Person B</strong>
                      <span>Same skills · Same experience</span>
                    </span>
                  </button>
                </div>

                <div className="onboarding-actions">
                  <button className="onboarding-secondary" type="button" onClick={() => setStep(1)}>
                    <ArrowLeft size={17} /> Back
                  </button>
                </div>
              </>
            ) : (
              <>
                <div className="survey-result-heading" role="status">
                  <p className="onboarding-label">How your choice compares</p>
                  <h1>{candidate === "a" ? "You chose the less popular candidate." : "You chose what most people chose."}</h1>
                  <p>
                    {candidate === "a"
                      ? <>Only <strong>18%</strong> chose Person A — even though both candidates had the same qualifications.</>
                      : <><strong>82%</strong> chose <strong>Person B</strong>, even though both candidates had the <strong>same qualifications</strong>. Appearance was the main visible difference.</>}
                  </p>
                </div>

                <figure
                  className={`survey-result-chart ${candidate === "a" ? "survey-result-chart--minority" : ""}`}
                  aria-label={`${candidate === "a" ? 18 : 82} percent chose ${candidate === "a" ? "Person A" : "Person B"} in this example`}
                >
                  <div className="survey-result-chart__bar" aria-hidden="true">
                    <span className={candidate === "a" ? "survey-result-chart__candidate-minority" : "survey-result-chart__candidate-majority"} />
                  </div>
                  <figcaption>
                    <span><strong>{candidate === "a" ? "18%" : "82%"}</strong><small>chose {candidate === "a" ? "Person A" : "Person B"} in this example</small></span>
                  </figcaption>
                </figure>

                <div className="survey-result-copy">
                  {candidate === "a" ? (
                    <p>Research found that attractive applicants received <strong>82% more callbacks</strong> from employers.</p>
                  ) : (
                    <>
                      <p>And this pattern shows up in real hiring.</p>
                      <p>In a field experiment involving <strong>4,899 résumés</strong>, attractive candidates received <strong>nearly twice as many callbacks</strong> as similarly qualified candidates rated as less attractive.</p>
                      <p><strong>Same qualifications. Different appearance. Different outcome.</strong></p>
                    </>
                  )}
                  <div className="response-research__links">
                    <a href="https://www.tandfonline.com/doi/pdf/10.1016/S1514-0326%2817%2930002-8" target="_blank" rel="noreferrer">
                      Galarza & Yamada · Journal of Applied Economics <ArrowRight size={14} />
                    </a>
                  </div>
                </div>

                <div className="onboarding-actions onboarding-actions--end">
                  <button className="onboarding-primary" type="button" onClick={() => setStep(3)}>
                    Continue <ArrowRight size={17} />
                  </button>
                </div>
              </>
            )}
          </div>
        ) : step === 3 ? (
          <div className="onboarding-step onboarding-step--profile" key="sex-reference">
            <div className="profile-question">
              <p className="onboarding-label">Your reference</p>
              <h1>Which sex should we use for your analysis?</h1>
              <p>This helps us compare facial proportions with a more relevant reference range.</p>
            </div>

            <div className="sex-options" role="radiogroup" aria-label="Sex reference">
              {([
                ["male", "Male", Mars],
                ["female", "Female", Venus],
              ] as const).map(([value, label, Icon]) => (
                <button
                  className={`sex-option ${sexReference === value ? "is-selected" : ""}`}
                  key={value}
                  type="button"
                  role="radio"
                  aria-checked={sexReference === value}
                  onClick={() => setSexReference(value)}
                >
                  <span className="sex-option__symbol" aria-hidden="true"><Icon /></span>
                  <span className="sex-option__label">{label}</span>
                  <span className="frequency-option__check" aria-hidden="true"><Check size={15} /></span>
                </button>
              ))}
            </div>

            <div className="onboarding-actions">
              <button className="onboarding-secondary" type="button" onClick={() => setStep(2)}>
                <ArrowLeft size={17} /> Back
              </button>
              <button className="onboarding-primary" type="button" disabled={!sexReference} onClick={() => setStep(4)}>
                Continue <ArrowRight size={17} />
              </button>
            </div>
          </div>
        ) : step === 4 ? (
          <div className="onboarding-step onboarding-step--profile onboarding-step--age" key="age-step">
            <div className="profile-question">
              <p className="onboarding-label">Your age</p>
              <h1>How old are you?</h1>
              <p>Age helps us use a more relevant comparison and explain age-related factors clearly.</p>
            </div>

            <div className="age-picker">
              <div
                aria-label="Drag to choose age"
                aria-valuemax={80}
                aria-valuemin={15}
                aria-valuenow={age}
                aria-valuetext={`${age} years old`}
                className={`age-wheel${isDraggingAge ? " is-dragging" : ""}`}
                onKeyDown={handleAgeKey}
                onPointerCancel={stopAgeDrag}
                onPointerDown={startAgeDrag}
                onPointerMove={moveAgeDrag}
                onPointerUp={stopAgeDrag}
                role="slider"
                tabIndex={0}
              >
                <div className="age-wheel__track">
                  {ageWindow.map((value, index) => (
                    <span className={index === 2 ? "is-current" : ""} key={`${value}-${index}`}>{value}</span>
                  ))}
                </div>
              </div>
              <div className="age-controls">
                <button type="button" aria-label="Decrease age" disabled={age <= 15} onClick={() => setAge((value) => Math.max(15, value - 1))}><Minus size={17} /></button>
                <input
                  aria-label="Fine tune age"
                  type="range"
                  min="15"
                  max="80"
                  value={age}
                  onChange={(event) => setAge(Number(event.target.value))}
                />
                <button type="button" aria-label="Increase age" disabled={age >= 80} onClick={() => setAge((value) => Math.min(80, value + 1))}><Plus size={17} /></button>
              </div>
              <div className="age-limits"><span>15</span><span>80</span></div>
            </div>

            <div className="onboarding-actions">
              <button className="onboarding-secondary" type="button" onClick={() => setStep(3)}><ArrowLeft size={17} /> Back</button>
              <button className="onboarding-primary" type="button" onClick={() => setStep(5)}>Continue <ArrowRight size={17} /></button>
            </div>
          </div>
        ) : (
          <div className="onboarding-step onboarding-step--profile onboarding-step--country" key="birth-country">
            <div className="profile-question">
              <p className="onboarding-label">Your background</p>
              <h1>Where were you born?</h1>
              <p>We use your country of birth to select a more relevant population reference. It does not define your ethnicity.</p>
            </div>

            <div className={`country-picker${isCountryOpen ? " is-open" : ""}`} ref={countryPickerRef}>
              <Globe2 className="country-picker__icon" aria-hidden="true" strokeWidth={1.25} />
              <div className="country-picker__control">
                <span className="country-picker__label">Country of birth</span>
                <button
                  aria-controls="country-options"
                  aria-expanded={isCountryOpen}
                  className="country-picker__trigger"
                  type="button"
                  onClick={() => {
                    setCountryQuery("");
                    setIsCountryOpen((open) => !open);
                  }}
                >
                  {selectedCountry ? (
                    <span className="country-picker__value">
                      <CountryFlag key={selectedCountry.code} code={selectedCountry.code} />
                      {selectedCountry.name}
                    </span>
                  ) : <span className="country-picker__placeholder">Select country</span>}
                  <ChevronDown aria-hidden="true" size={18} />
                </button>

                {isCountryOpen && createPortal(
                  <>
                    <button
                      aria-label="Close country picker"
                      className="country-menu__scrim"
                      type="button"
                      onClick={() => setIsCountryOpen(false)}
                    />
                    <div className="country-menu" id="country-options" ref={countryMenuRef}>
                      <div className="country-menu__search">
                        <Search aria-hidden="true" size={17} />
                        <input
                          aria-label="Search countries"
                          autoComplete="off"
                          placeholder="Search country"
                          ref={countrySearchRef}
                          type="search"
                          value={countryQuery}
                          onChange={(event) => setCountryQuery(event.target.value)}
                          onKeyDown={(event) => {
                            if (event.key === "Escape") setIsCountryOpen(false);
                          }}
                        />
                      </div>
                      <div aria-label="Countries" className="country-menu__list" role="listbox">
                        {filteredCountries.map((country) => (
                          <button
                            aria-selected={country.code === birthCountry}
                            className={country.code === birthCountry ? "is-selected" : ""}
                            key={country.code}
                            role="option"
                            type="button"
                            onClick={() => {
                              setBirthCountry(country.code);
                              setCountryQuery("");
                              setIsCountryOpen(false);
                            }}
                          >
                            <CountryFlag code={country.code} />
                            <span>{country.name}</span>
                            {country.code === birthCountry && <Check aria-hidden="true" size={16} />}
                          </button>
                        ))}
                        {!filteredCountries.length && <p className="country-menu__empty">No country found</p>}
                      </div>
                    </div>
                  </>,
                  document.body,
                )}
              </div>
            </div>

            <div className="onboarding-actions">
              <button className="onboarding-secondary" type="button" onClick={() => setStep(4)}><ArrowLeft size={17} /> Back</button>
              <button className="onboarding-primary" type="button" disabled={!birthCountry} onClick={finish}>Continue <ArrowRight size={17} /></button>
            </div>
          </div>
        )}
      </section>
    </main>
  );
}
