import { type FormEvent, useState, useEffect, useRef, useCallback } from 'react';
import { Link, useNavigate } from 'react-router';
import { useDispatch, useSelector } from 'react-redux';
import { useDocumentTitle } from '../hooks/useDocumentTitle';
import { setSession } from '../auth/auth.utils';
import { register as registerService } from '../services/auth.service';
import { Paths } from '../routes/paths';
import { UserRole } from '../types/enums.types';
import { type RegisterType } from '../types/auth.types';
import { type RootState } from '../redux/store';
import { authStart, authSuccess, authFailure } from '../redux/slices/authSlice';
import '../styles/styleRegister.css';

/* ── רשימת ערים ישראליות ── */
const ISRAEL_CITIES = [
  'אבו גוש','אור יהודה','אור עקיבא','אילת','אלעד','אריאל','אשדוד','אשקלון',
  'באקה אל-גרביה','באר שבע','בית שאן','בית שמש','ביתר עילית','בני ברק',
  'גבעת שמואל','גבעתיים','גדרה','הוד השרון','הרצליה','חדרה','חולון','חיפה',
  'טבריה','טייבה','טירה','טירת כרמל','יבנה','יהוד-מונוסון','ירושלים',
  'כפר יונה','כפר סבא','כפר קאסם','כרמיאל','לוד','מודיעין-מכבים-רעות',
  'מודיעין עילית','מעלה אדומים','מעלות-תרשיחא','נהריה','נס ציונה','נצרת',
  'נצרת עילית (נוף הגליל)','נתיבות','נתניה','סכנין','עכו','עפולה','ערד',
  'פתח תקווה','צפת','קלנסווה','קריית אונו','קריית אתא','קריית ביאליק',
  'קריית גת','קריית מוצקין','קריית מלאכי','קריית שמונה','ראש העין',
  'ראשון לציון','רהט','רחובות','רמלה','רמת גן','רמת השרון','רעננה',
  'שדרות','תל אביב-יפו',
].sort();

/* ── שליפת רחובות מ-data.gov.il ── */
const fetchStreetsByCity = async (cityName: string): Promise<string[]> => {
  const url =
    `https://data.gov.il/api/3/action/datastore_search` +
    `?resource_id=9ad3862c-8391-4b2f-84a4-2d4c68625f4b` +
    `&q=${encodeURIComponent(cityName)}` +
    `&limit=200`;
  const res  = await fetch(url);
  const data = await res.json();
  if (!data.success) return [];
  const streets: string[] = [...new Set<string>(
    (data.result.records as any[])
      .filter((r: any) => r['שם_ישוב']?.trim() === cityName)
      .map((r: any)    => r['שם_רחוב']?.trim())
      .filter(Boolean)
  )].sort();
  return streets;
};

/* ── Validation ── */
type Errors = Partial<Record<
  'fullName' | 'email' | 'password' | 'phone' | 'city' | 'street' | 'server',
  string
>>;

const validate = (data: RegisterType): Errors => {
  const errs: Errors = {};
  if (!data.fullName.trim() || data.fullName.trim().split(' ').length < 2)
    errs.fullName = 'Please enter your first and last name';
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(data.email))
    errs.email = 'Please enter a valid email address';
  if (data.password.length < 8)
    errs.password = 'Password must be at least 8 characters';
  else if (!/[a-zA-Z]/.test(data.password) || !/[0-9]/.test(data.password))
    errs.password = 'Password must contain both letters and numbers';
  if (data.phone && !/^0[0-9]{9}$/.test(data.phone.replace(/-/g, '')))
    errs.phone = 'Please enter a valid phone number';
  if (!data.city || data.city.trim().length < 2)
    errs.city = 'Please select a city';
  if (!data.street || data.street.trim().length < 2)
    errs.street = 'Please select a street';
  return errs;
};

export const RegisterPage = () => {
  useDocumentTitle('Register');
  const navigate  = useNavigate();
  const dispatch  = useDispatch();
  const { loading, error } = useSelector((state: RootState) => state.auth);

  const [errors,  setErrors]  = useState<Errors>({});
  const [touched, setTouched] = useState<Partial<Record<keyof Errors, boolean>>>({});
  const markTouched = (name: keyof Errors) =>
    setTouched(prev => ({ ...prev, [name]: true }));

  /* ── City ── */
  const [cityInput,        setCityInput]        = useState('');
  const [selectedCity,     setSelectedCity]     = useState('');
  const [showCityDropdown, setShowCityDropdown] = useState(false);
  const cityRef = useRef<HTMLDivElement>(null);

  const filteredCities = ISRAEL_CITIES.filter(c =>
    cityInput === '' || c.includes(cityInput)
  );

  /* ── Street ── */
  const [streetInput,        setStreetInput]        = useState('');
  const [allStreets,         setAllStreets]         = useState<string[]>([]);
  const [filteredStreets,    setFilteredStreets]    = useState<string[]>([]);
  const [showStreetDropdown, setShowStreetDropdown] = useState(false);
  const [loadingStreets,     setLoadingStreets]     = useState(false);
  const streetRef = useRef<HTMLDivElement>(null);

  /* כשנבחרת עיר — טוען את כל רחובותיה מיד */
  const loadStreets = useCallback(async (city: string) => {
    setLoadingStreets(true);
    setAllStreets([]);
    setFilteredStreets([]);
    setStreetInput('');
    setShowStreetDropdown(false);
    try {
      const streets = await fetchStreetsByCity(city);
      setAllStreets(streets);
      setFilteredStreets(streets);
      setShowStreetDropdown(streets.length > 0);
    } catch {
      setAllStreets([]);
    } finally {
      setLoadingStreets(false);
    }
  }, []);

  /* פילטור בזמן הקלדה */
  useEffect(() => {
    setFilteredStreets(
      streetInput === ''
        ? allStreets
        : allStreets.filter(s => s.includes(streetInput))
    );
  }, [streetInput, allStreets]);

  /* סגירת dropdowns בלחיצה מחוץ */
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (cityRef.current   && !cityRef.current.contains(e.target as Node))
        setShowCityDropdown(false);
      if (streetRef.current && !streetRef.current.contains(e.target as Node))
        setShowStreetDropdown(false);
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  /* ── Submit ── */
  const register = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const formData = new FormData(event.currentTarget);
    const data: RegisterType = {
      fullName:      formData.get('fullName') as string,
      email:         formData.get('email')    as string,
      password:      formData.get('password') as string,
      phone:         formData.get('phone')    as string,
      city:          selectedCity,
      street:        streetInput,
      userRole:      Number(formData.get('role')),
      categoryIds:    [],
      availabilities: [],
    };

    const errs = validate(data);
    setTouched({ fullName: true, email: true, password: true, phone: true, city: true, street: true });
    setErrors(errs);
    if (Object.keys(errs).length > 0) return;

    try {
      dispatch(authStart());
      const response = await registerService({ ...data, userRole: data.userRole });
      setSession(response.token);
      dispatch(authSuccess({ user: response.user, token: response.token }));
      if (response.user.userRole === UserRole.Volunteer) navigate(Paths.homeVolunteer);
      else navigate(Paths.homeNeedy);
    } catch (err: any) {
      const serverData = err?.response?.data;
      const message =
        serverData?.message
        ?? serverData?.error
        ?? (typeof serverData === 'string' ? serverData : null)
        ?? err?.message
        ?? 'Something went wrong, please try again';
      dispatch(authFailure(message));
    }
  };

  const err = (name: keyof Errors) =>
    touched[name] && errors[name]
      ? <span className="w1-err">{errors[name]}</span>
      : null;

  const inpClass = (name: keyof Errors) =>
    `w1-inp ${touched[name] && errors[name] ? 'w1-inp-err' : touched[name] ? 'w1-inp-ok' : ''}`;

  return (
    <div className="w1-root">

      {/* ── LEFT ── */}
      <div className="w1-left">
        <div className="w1-deco-c1" /><div className="w1-deco-c2" /><div className="w1-deco-c3" />
        <div className="w1-logo">
          <div className="w1-logo-icon">🤝</div>
          Together
        </div>
        <div className="w1-mid">
          <div className="w1-tag">✦ Community Platform</div>
          <h1 className="w1-h1">Give help.<br /><em>Receive</em><br />kindness.</h1>
          <p className="w1-p">
            A space where volunteers and those in need find each other —
            built on trust, driven by community.
          </p>
        </div>
       
      </div>

      {/* ── RIGHT ── */}
      <div className="w1-right">
        <div className="w1-step">New Account</div>
        <h2 className="w1-form-h">Create your<br />free account</h2>

        {error && <div className="w1-banner-err">⚠ {error}</div>}

        <form onSubmit={register} noValidate>
          <div className="w1-grid">

            <div className="w1-f w1-span">
              <label className="w1-lbl">Full Name</label>
              <input className={inpClass('fullName')}
                name="fullName" placeholder="First & last name" required
                onBlur={() => markTouched('fullName')} />
              {err('fullName')}
            </div>

            <div className="w1-f w1-span">
              <label className="w1-lbl">Email</label>
              <input className={inpClass('email')}
                type="email" name="email" placeholder="you@email.com" required
                onBlur={() => markTouched('email')} />
              {err('email')}
            </div>

            <div className="w1-f w1-span">
              <label className="w1-lbl">Password</label>
              <input className={inpClass('password')}
                type="password" name="password" placeholder="Min 8 characters" required
                onBlur={() => markTouched('password')} />
              {err('password')}
            </div>

            <div className="w1-f w1-span">
              <label className="w1-lbl">Phone</label>
              <input className={inpClass('phone')}
                type="tel" name="phone" placeholder="05X-XXXXXXX"
                onBlur={() => markTouched('phone')} />
              {err('phone')}
            </div>

            {/* ── City + Street זה לצד זה ── */}
            <div className="w1-f w1-address-city" ref={cityRef}>
              <label className="w1-lbl">City</label>
              <input
                className={inpClass('city')}
                type="text"
                placeholder="Search city..."
                value={cityInput}
                autoComplete="off"
                onChange={e => {
                  setCityInput(e.target.value);
                  setSelectedCity('');
                  setShowCityDropdown(true);
                  setStreetInput('');
                  setAllStreets([]);
                  setFilteredStreets([]);
                  setShowStreetDropdown(false);
                }}
                onFocus={() => setShowCityDropdown(true)}
                onBlur={() => markTouched('city')}
              />
              {err('city')}
              {showCityDropdown && (
                <div className="w1-suggestions">
                  {filteredCities.length > 0
                    ? filteredCities.map(c => (
                        <div
                          key={c}
                          className={`w1-suggestion-item${c === selectedCity ? ' w1-suggestion-active' : ''}`}
                          onMouseDown={() => {
                            setSelectedCity(c);
                            setCityInput(c);
                            setShowCityDropdown(false);
                            markTouched('city');
                            loadStreets(c);
                          }}
                        >{c}</div>
                      ))
                    : <div className="w1-suggestion-empty">No city found</div>
                  }
                </div>
              )}
            </div>

            <div className="w1-f w1-address-street" ref={streetRef}>
              <label className="w1-lbl">
                Street
                {loadingStreets && <span className="w1-lbl-spinner" />}
              </label>
              <input
                className={inpClass('street')}
                type="text"
                placeholder={
                  !selectedCity  ? 'Select city first'   :
                  loadingStreets ? 'Loading streets...'  :
                                   'Filter or pick...'
                }
                value={streetInput}
                disabled={!selectedCity || loadingStreets}
                autoComplete="off"
                onChange={e => {
                  setStreetInput(e.target.value);
                  setShowStreetDropdown(true);
                }}
                onFocus={() => filteredStreets.length > 0 && setShowStreetDropdown(true)}
                onBlur={() => markTouched('street')}
              />
              {err('street')}
              {showStreetDropdown && filteredStreets.length > 0 && (
                <div className="w1-suggestions">
                  {filteredStreets.map(s => (
                    <div
                      key={s}
                      className={`w1-suggestion-item${s === streetInput ? ' w1-suggestion-active' : ''}`}
                      onMouseDown={() => {
                        setStreetInput(s);
                        setShowStreetDropdown(false);
                        markTouched('street');
                      }}
                    >{s}</div>
                  ))}
                </div>
              )}
            </div>

          </div>{/* /w1-grid */}

          <div className="w1-role-lbl">I want to join as</div>
          <div className="w1-roles">
            <div className="w1-rc">
              <input type="radio" name="role" id="w1-vol" value={UserRole.Volunteer} defaultChecked />
              <label className="w1-rl" htmlFor="w1-vol">
                <span className="w1-ri">🤲</span>
                <div><div className="w1-rn">Volunteer</div><div className="w1-rd">I want to help</div></div>
              </label>
            </div>
            <div className="w1-rc">
              <input type="radio" name="role" id="w1-need" value={UserRole.Needy} />
              <label className="w1-rl" htmlFor="w1-need">
                <span className="w1-ri">🙏</span>
                <div><div className="w1-rn">Request Help</div><div className="w1-rd">I need support</div></div>
              </label>
            </div>
          </div>

          <button className="w1-btn" type="submit" disabled={loading}>
            {loading ? <span className="w1-spinner" /> : 'Create Account →'}
          </button>

          <p className="w1-foot">Already a member? <Link to={Paths.login}>Sign in</Link></p>
        </form>
      </div>
    </div>
  );
};
