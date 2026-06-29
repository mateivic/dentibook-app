import type { Dictionary } from "./dictionary";

export const hr: Dictionary = {
    intro: {
        cta: "Rezervirajte termin",
    },
    wizard: {
        title: (clinicName) => `Naručite se u ${clinicName}`,
        noLocations: "Trenutačno nema dostupnih lokacija. Pokušajte kasnije.",
    },
    nav: {
        back: "Natrag",
        continue: "Nastavi",
        confirm: "Potvrdi rezervaciju",
        submitting: "Slanje…",
    },
    progress: {
        aria: "Tijek rezervacije",
        location: "Lokacija",
        services: "Usluge",
        datetime: "Datum i vrijeme",
        contact: "Podaci",
    },
    location: {
        heading: "Odaberite lokaciju",
    },
    services: {
        heading: "Odaberite usluge",
        total: (duration) => `Ukupno: ${duration}`,
        none: "Na ovoj lokaciji trenutačno nema dostupnih usluga.",
        free: "Besplatno",
    },
    datetime: {
        heading: "Odaberite datum i vrijeme",
        finding: "Tražim slobodne termine",
        loadError: "Termine nije moguće učitati.",
        noSlots: "Nema slobodnih termina za ovaj datum.",
    },
    contact: {
        heading: "Vaši podaci",
        locationLabel: "Lokacija: ",
        whenLabel: "Termin: ",
        servicesLabel: "Usluge: ",
        totalLabel: (price) => `Ukupno: ${price}`,
        firstName: "Ime",
        lastName: "Prezime",
        email: "E-mail",
        phone: "Telefon",
        notes: "Napomena (nije obavezno)",
    },
    validation: {
        firstName: "Unesite svoje ime.",
        lastName: "Unesite svoje prezime.",
        email: "Unesite ispravnu e-mail adresu.",
        phoneRequired: "Unesite broj telefona.",
        phoneInvalid: "Unesite ispravan broj telefona.",
    },
    submitting: {
        heading: "Potvrđujem vašu rezervaciju…",
        subtext: "Trenutak, molimo ne zatvarajte ovaj prozor.",
    },
    success: {
        heading: "Hvala vam!",
        message:
            "Veselimo se vašem dolasku. Potvrdu termina primit ćete e-mailom.",
        again: "Nova rezervacija",
    },
};
