function getUsernameAndPasswordFields () {
    const kUsernameLatin = [
        "gatti", "uzantonomo", "solonanarana", "nombredeusuario",
        "olumulo", "nomenusoris", "enwdefnyddiwr", "nomdutilisateur",
        "lolowera", "notandanafn", "nomedeusuario", "vartotojovardas",
        "username", "ahanjirimara", "gebruikersnaam", "numedeutilizator",
        "brugernavn", "benotzernumm", "jinalamtumiaji", "erabiltzaileizena",
        "brukernavn", "benutzername", "sunanmaiamfani", "foydalanuvchinomi",
        "mosebedisi", "kasutajanimi", "ainmcleachdaidh", "igamalomsebenzisi",
        "nomdusuari", "lomsebenzisi", "jenengpanganggo", "ingoakaiwhakamahi",
        "nomeutente", "namapengguna"];

    const kUsernameNonLatin = [
        "用户名", "کاتيجونالو", "用戶名", "የተጠቃሚስም", "логин",
        "اسمالمستخدم", "נאמען", "کاصارفکانام", "ユーザ名",
        "όνομα χρήστη", "brûkersnamme", "корисничкоиме", "nonitilizatè",
        "корисничкоиме", "ngaranpamaké", "ຊື່ຜູ້ໃຊ້", "användarnamn", "korisničkoime",
        "пайдаланушыаты", "שםמשתמש", "ім'якористувача", "کارننوم",
        "хэрэглэгчийннэр", "nomedeusuário", "имяпользователя", "têntruynhập", "பயனர்பெயர்",
        "ainmúsáideora", "ชื่อผู้ใช้", "사용자이름", "імякарыстальніка",
        "lietotājvārds", "потребителскоиме", "uporabniškoime", "колдонуучунунаты",
        "kullanıcıadı", "පරිශීලකනාමය", "istifadəçiadı", "օգտագործողիանունը",
        "navêbikarhêner", "emriipërdoruesit", "वापरकर्तानाव", "käyttäjätunnus",
        "વપરાશકર્તાનામ", "felhasználónév", "उपयोगकर्तानाम", "nazwaużytkownika",
        "ഉപയോക്തൃനാമം", "სახელი", "نامکاربری", "प्रयोगकर्तानाम",
        "uživatelskéjméno", "ব্যবহারকারীরনাম", "užívateľskémeno"
    ];

    const kUserLatin = [
        "user", "wosuta", "gebruiker", "utilizator",
        "usor", "notandi", "gumagamit", "vartotojas",
        "fammi", "olumulo", "maiamfani", "cleachdaidh",
        "utent", "pemakai", "mpampiasa", "umsebenzisi",
        "bruger", "usuario", "panganggo", "utilisateur",
        "bruker", "benotzer", "uporabnik", "doutilizador",
        "numake", "benutzer", "covneegsiv", "erabiltzaile",
        "usuari", "kasutaja", "defnyddiwr", "kaiwhakamahi",
        "utente", "korisnik", "mosebedisi", "foydalanuvchi",
        "uzanto", "pengguna", "mushandisi"];

    const kUserNonLatin = [
        "用户", "użytkownik", "tagatafaʻaaogā", "دکارونکيعکس",
        "用戶", "užívateľ", "корисник", "карыстальнік",
        "brûker", "kullanıcı", "истифода", "អ្នកប្រើ",
        "ọrụ", "ተጠቃሚ", "באַניצער", "хэрэглэгчийн",
        "يوزر", "istifadəçi", "ຜູ້ໃຊ້", "пользователь",
        "صارف", "meahoʻohana", "потребител", "वापरकर्ता",
        "uživatel", "ユーザー", "מִשׁתַמֵשׁ", "ผู้ใช้งาน",
        "사용자", "bikaranîvan", "колдонуучу", "વપરાશકર્તા",
        "përdorues", "ngườidùng", "корисникот", "उपयोगकर्ता",
        "itilizatè", "χρήστης", "користувач", "օգտվողիանձնագիրը",
        "használó", "faoiúsáideoir", "შესახებ", "ব্যবহারকারী",
        "lietotājs", "பயனர்", "ಬಳಕೆದಾರ", "ഉപയോക്താവ്",
        "کاربر", "యూజర్", "පරිශීලක", "प्रयोगकर्ता",
        "användare", "المستعمل", "пайдаланушы", "အသုံးပြုသူကို",
        "käyttäjä"
    ];

    const kTechnicalWords = [
        "uid", "newtel", "uaccount", "regaccount", "ureg",
        "loginid", "laddress", "accountreg", "regid", "regname",
        "loginname", "membername", "uname", "ucreate", "loginmail",
        "accountname", "umail", "loginreg", "accountid", "loginaccount",
        "ulogin", "regemail", "newmobile", "accountlogin"];

    const kWeakWords = ["id", "login", "mail"];

    const kMatches = kUsernameLatin.concat(kUsernameNonLatin, kUserLatin, kUserNonLatin, kTechnicalWords, kWeakWords);

    let passwordField = document.querySelectorAll("input[type='password']")[0];
    let possibleUserNameFields = Array.prototype.slice.call(document.querySelectorAll("input[type='text'],input:not([type]),input[type='email']"));
        
    for (let i = 0; i < possibleUserNameFields.length; i++) {
        const userNameField = possibleUserNameFields[i];
        if (kMatches.find(a => userNameField.name.toLowerCase().includes(a))) {
            return {userNameField: userNameField, passwordField: passwordField}
        }
    }

};