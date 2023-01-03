var language = $('html').attr('lang');
var parseTime = d3.timeParse("%Y-%m-%d");
var formatTime = d3.timeFormat("%d %b %Y");
var formatTimeLong = d3.timeFormat("%B %e, %Y");
var locale;
var localeFormatter;
var numberFormat, percentFormat, rateFormat, decimalFormat;
var toggleTotalDoses = false;
var pattern = ",",
    re = new RegExp(pattern, "g");
var isIE = /*@cc_on!@*/ false || !!document.documentMode;
if (/Edge\/\d./i.test(navigator.userAgent))
    isIE = true;
//var currentQueryString = "fig=f1&dd1=monthly&dd2=all&fig=f2&dd1=number&dd2=all&fig=f3&dd1=number&dd2=ageGroup&fig=f4&dd1=number&dd2=total&fig=f5&dd1=count&dd2=total-events";
//Query string reader
// var getParams = function(url) {
// 	var params = {};
// 	var figuresJson = {};
// 	var parser = document.createElement('a');
// 	parser.href = url;
// 	var query = parser.search.substring(1);
// 	var figures = query.split('fig');
// 	figures.shift();
// 	for (var i = 0; i < figures.length; i++) {
// 	    var vars = figures[i].split("&");
// 	    params = {};
// 	    for (var j = 0; j < vars.length; j++) {
// 		    var pair = vars[j].split('=');
// 		    if(params[pair[0]] !== "")
// 		        params[pair[0]] = decodeURIComponent(pair[1]);
// 	    }
// 	    figuresJson[figures[i].substring(1,3)] = params;
// 	}
//validate query string
// 	for(var i = 0; i < Object.keys(figuresJson).length; i++){
// 	    for(var j= 0; j < Object.keys(Object.keys(figuresJson)[i]).length; i++)
// 	        if(queryStringOptions[Object.keys(figuresJson)[i]]["dd1"].includes(Object.keys(Object.keys(figuresJson)[i]))))

// 	}
// 	return figuresJson;
// };
// var queryStringOptions = {
// 	"f1": {
// 		"dd1": ["monthly", "rate", "monthly&rate", "total"],
// 		"dd2": ["all", "18plus", "12to17", "5to11"]
// 	},
// 	"f2": {
// 		"dd1": ["number", "rate"],
// 		"dd2": ["all", "18plus", "12to17", "5to11"]
// 	},
// 	"f3": {
// 		"dd1": ["number", "rate"],
// 		"dd2": ["ageGroup", "both"]
// 	},
// 	"f4": {
// 		"dd1": ["number", "rate"],
//     	"dd2": ["total", "pfizer", "moderna", "astrazeneca", "unspecified", "total_last7", "deaths_last7"]
// 	},
// 	"f5": {
// 		"dd1": ["count", "rate"],
// 		"dd2": ["total-events", "pfizer-events", "moderna-events", "cov-azc-events", "unspecifiedOption"],
// 	}
// }
// function updateSelectOptions(figure) {
//     var dd1;
//     var dd2;
//     var shortCut;
//     switch(figure){
//         case "f1":
//             dd1 = "figure1-dropdown-measure";
//             dd2 = "figure1-dropdown-measure3";
//             shortCut = "#a3";
//             break;
//         case "f2":
//             dd1 = "figure2-dropdown-measure";
//             dd2 = "figure2-dropdown-measure2";
//             shortCut = "#a4";
//             break;
//         case "f3":
//             dd1 = "figure3-dropdown-measure2";
//             dd2 = "figure3-dropdown-measure";
//             shortCut = "#ageSex";
//             break;
//         case "f4":
//             dd1 = "figure4-dropdown-measure2";
//             dd2 = "figure4-dropdown-measure";
//             shortCut = "#seriousNonSerious";
//             break;
//         case "f5":
//             dd1 = "AESITable2-dropdown-measure";
//             dd2 = "AESITable-dropdown-measure";
//             shortCut = "#specialInterest";
//             break;
//     }
//     var insertQueryStringEntry = "fig="+figure+"&dd1="+$("#"+dd1).val()+"&dd2="+$("#"+dd2).val();
//     if(currentQueryString.substring(currentQueryString.substring(currentQueryString.indexOf(figure)).indexOf("dd2")).indexOf("&") == -1)
//         currentQueryString = currentQueryString.replace(currentQueryString.substring(currentQueryString.indexOf(figure)),insertQueryStringEntry);
//     else
//         currentQueryString = currentQueryString.replace(currentQueryString.substring(currentQueryString.indexOf(figure)-4,currentQueryString.indexOf(figure)-4 + currentQueryString.substring(currentQueryString.indexOf(figure)-4).indexOf("dd2") + currentQueryString.substring(currentQueryString.indexOf(figure)-4).substring(currentQueryString.substring(currentQueryString.indexOf(figure)-4).indexOf("dd2")).indexOf("&")),insertQueryStringEntry);

// 	window.history.replaceState(null, null, window.location.origin + window.location.pathname + '?' + currentQueryString + shortCut);
// }
Math.log10 = Math.log10 || function(x) {
    return Math.log(x) * Math.LOG10E;
};

if (language == "en") {
    numberFormat = d3.format(",d");
    percentFormat = d3.format(",.3f");
    decimalFormat = d3.format(",.2f");
}
else {
    locale = {
        "dateTime": "%a %e %b %Y %X",
        "": "%Y-%m-%d",
        "time": "%H:%M:%S",
        "periods": ["", ""],
        "days": ["dimanche", "lundi", "mardi", "mercredi", "jeudi", "vendredi", "samedi"],
        "shortDays": ["dim", "lun", "mar", "mer", "jeu", "ven", "sam"],
        "months": ["janvier", "février", "mars", "avril", "mai", "juin", "juillet", "août", "septembre", "octobre", "novembre", "décembre"],
        "shortMonths": ["jan", "fév", "mar", "avr", "mai", "jui", "jul", "aoû", "sep", "oct", "nov", "déc"],
        "decimal": ",",
        "thousands": " ",
        "grouping": [3]
    }
    // create custom locale formatter for time from the fgiven locale options
    d3.timeFormatDefaultLocale(locale);
    formatTime = d3.timeFormat("%d %B %Y");
    formatTimeLong = d3.timeFormat("%e %B %Y");
    // create custom locale formatter for numbers from the given locale options
    localeFormatter = d3.formatDefaultLocale(locale);
    numberFormat = localeFormatter.format(",d");
    percentFormat = localeFormatter.format(",.3f");
    decimalFormat = localeFormatter.format(",.2f");
}

function getRoundedSFs(num, SFCount) {
    // This runs a regex to match every "leading zeros" before and after the .
    // For the record, it splits before and after in two groups, if necessary...
    var matches = num.toString().match(/^-?(0+)\.(0*)/);

    if (matches) { // if we found at least a "0."
        var firstIndex = matches[0].length;
        var prefix = matches[0];

        sf = Number(num.toString().substring(firstIndex, firstIndex + SFCount + 1));
        sf = Math.round(sf / 10);
        sf = prefix + sf.toString();
        return Number(sf).toFixed(matches[2].length + SFCount); //matches[;
    }
    else { // possible float not starting with 0.  like -5.574487436097115
        // matching before and after, no matter if 0 or not
        matches = num.toString().match(/^(-?(\d+))\.(\d+)/);

        // Rounding at good index
        var decimalShift = SFCount - matches[2].length;
        var rounded = Math.round(num * Math.pow(10, decimalShift));
        rounded /= Math.pow(10, decimalShift);

        return rounded.toFixed(decimalShift);
    }
}

function maxIndex(arr) {
    if (arr.length === 0) {
        return -1;
    }
    var max;
    if (isNaN(arr[0]))
        max = 0;
    else
        max = arr[0];

    var maxIndex = 0;

    for (var i = 1; i < arr.length; i++) {
        if (arr[i] > max) {
            maxIndex = i;
            max = arr[i];
        }
    }

    return maxIndex;
}

function short2txt(short) {
    var shortLookup = {
        "Anaphylaxis*": "Anaphylaxis<sup>1</sup>",
        "Anaphylaxis": "Anaphylaxis",
        "Headache": "headache",
        "Severe allergic reaction": "severe allergic reaction",
        "Facial paralysis": "facial paralysis",
        "Chills": "Chills",
        "Syncope": "Syncope",
        "Pain in extremity": "Pain in extremity",
        "Burning sensation": "Burning sensation",
        "Vaccination site reactions": "Vaccination site reactions",
        "Palpitations": "Palpitations",
        "Pharyngeal swelling (throat swelling)": "Pharyngeal swelling (throat swelling)",
        "Tachypnoea (abnormally rapid breathing)": "Tachypnoea (abnormally rapid breathing)",
        "Nausea": "nausea",
        "Throat irritation": "Throat irritation",
        "Paraesthesia": "paraesthesia",
        "Hypersensitvity": "Hypersensitvity",
        "Total doses administered": "Total doses administered",
        "Pruritis": "pruritis",
        "Urticaria": "urticaria",
        "monthly&rate": "Bimonthly",
        "COVID-19*": "COVID-19<sup>2</sup>",
        "Bell's Palsy": "Bell's Palsy",
        "Mod COVID-19": "Moderna Spikevax",
        "Moderna (Total)": "Moderna Spikevax (Total)",
        "Moderna (Dose 1)": "Moderna Spikevax (Dose 1)",
        "Moderna (Dose 2)": "Moderna Spikevax (Dose 2)",
        "Moderna (Dose 3)": "Moderna Spikevax (Dose 3)",
        "Moderna (Dose 4+)": "Moderna Spikevax (Dose 4+)",
        "Novavax (Total)": "Novavax Nuvaxovid (Total)",
        "Novavax (Dose 1)": "Novavax Nuvaxovid (Dose 1)",
        "Novavax (Dose 2)": "Novavax Nuvaxovid (Dose 2)",
        "Novavax (Dose 3)": "Novavax Nuvaxovid (Dose 3)",
        "Novavax (Dose 4+)": "Novavax Nuvaxovid (Dose 4+)",
        "AZC COVID-19": "AstraZeneca Vaxzevria",
        "AZC COVID-19 ": "AstraZeneca Vaxzevria",
        "Fever GE 38C": "Fever ≥ 38°C",
        "Bell's Palsy/Facial paralysis": "Bell's Palsy/facial paralysis",
        "Bell's Palsy/facial paralysis": "Bell's Palsy/facial paralysis",
        "Bell's Palsy/facial paralysis*": "Bell's Palsy<sup>1</sup>/facial paralysis",
        "PB COVID-19": "Pfizer-BioNTech Comirnaty",
        "Pfizer-BioNTech (Total)": "Pfizer-BioNTech Comirnaty (Total)",
        "Pfizer-BioNTech (Dose 1)": "Pfizer-BioNTech Comirnaty (Dose 1)",
        "Pfizer-BioNTech (Dose 2)": "Pfizer-BioNTech Comirnaty (Dose 2)",
        "Pfizer-BioNTech (Dose 3)": "Pfizer-BioNTech Comirnaty (Dose 3)",
        "Pfizer-BioNTech (Dose 4+)": "Pfizer-BioNTech Comirnaty (Dose 4+)",
        "AZC COVID-19 (COVISHIELD)": "COVISHIELD",
        "Unknown": "Unknown",
        "Total": "Total",
        "Oropharyngeal (throat) pain": "Oropharyngeal (throat) pain",
        "Peripheral swelling": "Peripheral swelling",
        "Drug ineffective": "drug ineffective",
        "SARS-CoV-2 positive": "SARS-CoV-2 positive",
        "AstraZeneca/COVISHIELD (combined)": "AstraZeneca Vaxzevria/COVISHIELD",
        "COVISHIELD/AstraZeneca (Total)": "AstraZeneca Vaxzevria/COVISHIELD (Total)",
        "COVISHIELD/AstraZeneca (Dose 1)": "AstraZeneca Vaxzevria/COVISHIELD (Dose 1)",
        "COVISHIELD/AstraZeneca (Dose 2)": "AstraZeneca Vaxzevria/COVISHIELD (Dose 2)",
        "COVISHIELD/AstraZeneca (Dose 3)": "AstraZeneca Vaxzevria/COVISHIELD (Dose 3)",
        "COVISHIELD/AstraZeneca (Dose 4+)": "AstraZeneca Vaxzevria/COVISHIELD (Dose 4+)",
        "Janssen Jcovden (Total)": "Janssen JCOVDEN (Total)",
        "Janssen Jcovden (Dose 1)": "Janssen JCOVDEN (Dose 1)",
        "Janssen Jcovden (Dose 2)": "Janssen JCOVDEN (Dose 2)",
        "Janssen Jcovden (Dose 3)": "Janssen JCOVDEN (Dose 3)",
        "Janssen Jcovden (Dose 4+)": "Janssen JCOVDEN (Dose 4+)",
        "Unknown vaccine (Total)": "Unknown vaccine (Total)",
        "Jcovden": "JCOVDEN",
        "Unknown vaccine (Dose 1)": "Unknown vaccine (Dose 1)",
        "Unknown vaccine (Dose 2)": "Unknown vaccine (Dose 2)",
        "Unknown vaccine (Dose 3)": "Unknown vaccine (Dose 3)",
        "Unknown vaccine (Dose 4+)": "Unknown vaccine (Dose 4+)",
        "Comirnaty Original & Omicron BA.4/BA.5 Bivalent (Total)":"Pfizer-BioNTech Comirnaty (Original and Omicron BA.4/BA.5) Bivalent (Total)",
        "Comirnaty Original & Omicron BA.4/BA.5 Bivalent (Dose 1)":"Pfizer-BioNTech Comirnaty (Original and Omicron BA.4/BA.5) Bivalent (Dose 1)",
        "Comirnaty Original & Omicron BA.4/BA.5 Bivalent (Dose 2)":"Pfizer-BioNTech Comirnaty (Original and Omicron BA.4/BA.5) Bivalent (Dose 2)",
        "Comirnaty Original & Omicron BA.4/BA.5 Bivalent (Dose 3)":"Pfizer-BioNTech Comirnaty (Original and Omicron BA.4/BA.5) Bivalent (Dose 3)",
        "Comirnaty Original & Omicron BA.4/BA.5 Bivalent (Dose 4+)":"Pfizer-BioNTech Comirnaty (Original and Omicron BA.4/BA.5) Bivalent (Dose 4+)",
        "Moderna Spikevax (Original/OmicronBA.1) Bivalent (Total)":"Moderna Spikevax (Original and Omicron BA.1) Bivalent (Total)",
        "Moderna Spikevax (Original/OmicronBA.1) Bivalent (Dose 1)":"Moderna Spikevax (Original and Omicron BA.1) Bivalent (Dose 1)",
        "Moderna Spikevax (Original/OmicronBA.1) Bivalent (Dose 2)":"Moderna Spikevax (Original and Omicron BA.1) Bivalent (Dose 2)",
        "Moderna Spikevax (Original/OmicronBA.1) Bivalent (Dose 3)":"Moderna Spikevax (Original and Omicron BA.1) Bivalent (Dose 3)",
        "Moderna Spikevax (Original/OmicronBA.1) Bivalent (Dose 4+)":"Moderna Spikevax (Original and Omicron BA.1) Bivalent (Dose 4+)",
        "Moderna Spikevax (Original/OmicronBA.4/5) Bivalent (Total)":"Moderna Spikevax (Original and Omicron BA.4/5) Bivalent (Total)",
        "Moderna Spikevax (Original/OmicronBA.4/5) Bivalent (Dose 1)":"Moderna Spikevax (Original and Omicron BA.4/5) Bivalent (Dose 1)",
        "Moderna Spikevax (Original/OmicronBA.4/5) Bivalent (Dose 2)":"Moderna Spikevax (Original and Omicron BA.4/5) Bivalent (Dose 2)",
        "Moderna Spikevax (Original/OmicronBA.4/5) Bivalent (Dose 3)":"Moderna Spikevax (Original and Omicron BA.4/5) Bivalent (Dose 3)",
        "Moderna Spikevax (Original/OmicronBA.4/5) Bivalent (Dose 4+)":"Moderna Spikevax (Original and Omicron BA.4/5) Bivalent (Dose 4+)",
        "COVID-19": "COVID-19",
        "Hypersensitivity": "Hypersensitivity",
        "Pruritis (itching)": "Pruritis (itching)",
        "Abdominal pain upper": "abdominal pain upper",
        "Chest pain": "Chest pain",
        "Abdominal pain": "Abdominal pain",
        "Contusion": "contusion",
        "Eye pain": "eye pain",
        "Cerebral thrombosis": "Cerebral thrombosis",
        "Pulmonary embolism (blood clot in lung)": "Pulmonary embolism (blood clot in lung)",
        "Dypshonia (hoarse voice)": "Dypshonia (hoarse voice)",
        "Joint range of motion decreased": "Joint range of motion decreased",
        "Eye swelling": "eye swelling",
        "Injection site nodule": "injection site nodule",
        "Chest discomfort": "Chest discomfort",
        "Hypoaesthesia": "hypoaesthesia",
        "Hypoaesthesia oral": "hypoaesthesia oral",
        "Dyspnoea": "dyspnoea",
        "Pruritus": "Pruritus",
        "Asthenia (weakness)": "Asthenia (weakness)",
        "Hyperhidrosis (excessive sweating)": "Hyperhidrosis (excessive sweating)",
        "total": "Total",
        "monthly": "Bimonthly",
        "Vaccination site pain": "Vaccination site pain",
        "Vaccintion site erythema (redness)": "Vaccintion site erythema (redness)",
        "Vaccination site erythema (redness)": "Vaccination site erythema (redness)",
        "Vaccination site swelling": "Vaccination site swelling",
        "Vaccination site warmth": "Vaccination site warmth",
        "Vaccination site pruritus (itching)": "Vaccination site pruritus (itching)",
        "Paraesthesia (tingling or prickling)": "Paraesthesia (tingling or prickling)",
        "Pruritus (itching)": "Pruritus (itching)",
        "Cov COVID-19": "Cov COVID-19",
        "Headache": "Headache",
        "Show total doses administered": "Show total doses administered",
        "Urticaria (hives)": "Urticaria (hives)",
        "Vaccination site reaction": "Vaccination site reaction",
        "Nausea": "Nausea",
        "Vaccination site cellulitis": "Vaccination site cellulitis",
        "Vaccination site induration (hardening)": "Vaccination site induration (hardening)",
        "Dyspnoea (laboured breathing)": "Dyspnoea (laboured breathing)",
        "Rash": "Rash",
        "Vaccination site rash": "Vaccination site rash",
        "Fatigue": "Fatigue",
        "Hypoaesthesia (numbness)": "Hypoaesthesia (numbness)",
        "Anaphylaxies": "Anaphylaxies",
        "Other allergic reactions": "Other allergic reactions",
        "Dizziness": "Dizziness",
        "Adenopathy/lymphadenopathy (swollen lymph nodes)": "Swollen lymph nodes",
        "Adenopathy/lymphadenopathy": "Adenopathy/lymphadenopathy",
        "Erythema (redness)": "Erythema (redness)",
        "Vomiting": "Vomiting",
        "Diarrhea": "Diarrhea",
        "Fever ≥ 38°C": "Fever ≥ 38°C",
        "Tachycardia (fast heartbeat)": "Tachycardia (fast heartbeat)",
        "Throat tightness": "Throat tightness",
        "Vaccination site induration (hardness)": "Vaccination site induration (hardness)",
        "Vaccination site inflammation": "Vaccination site inflammation",
        "Myalgia (muscle pain)": "Myalgia (muscle pain)",
        "Pain": "Pain",
        "Arthralgia (joint pain)": "Arthralgia (joint pain)",
        "Vaccination site pruitis (itching)": "Vaccination site pruitis (itching)",
        "Flushing": "Flushing",
        "Malaise (discomfort)": "Malaise (discomfort)",
        "Feeling hot": "Feeling hot",
        "Lip swelling": "Lip swelling",
        "Swollen tongue": "Swollen tongue",
        "Malaise": "Malaise",
        "Cough": "Cough",
        "Dysphagia": "Dysphagia",
        "Dysphonia (hoarse voice)": "Dysphonia (hoarse voice)",
        "Oropharyngeal pain (throat pain)": "Oropharyngeal pain (throat pain)",
        "Anaphylactic reaction": "Anaphylactic reaction",
        "Tachycardia (fast hearbeat)": "Tachycardia (fast hearbeat)",
        "Tachycardia": "Tachycardia",
        "Swelling face": "Swelling face",
        "Anaphylaxis (BCD levels 1-3)": "Anaphylaxis",
        "Extensive swelling of vaccinated limb": "Extensive swelling of vaccinated limb",
        "Hypertension": "Hypertension",
        "Dermatitis allergic": "Dermatitis allergic",
        "Vaccination site oedema": "Vaccination site oedema",
        "Hypoaesthesia oral (numbness oral)": "Hypoaesthesia oral (numbness oral)",
        "Dysphagia (difficulty swallowing)": "Dysphagia (difficulty swallowing)",
        "Non-serious reporting rate": "Non-serious reporting rate",
        "Serious reporting rate": "Serious reporting rate",
        "total-rate": "Total rate",
        "N/A": "N/A",
        "Auto-immune diseases": "Auto-immune diseases",
        "Cardiovascular system": "Cardiovascular system",
        "Hepato-gastrointestinal and renal system": "Hepato-gastrointestinal and renal system",
        "Nerves and central nervous system": "Nerves and central nervous system",
        "Other system": "Other system",
        "Pregnancy outcomes": "Pregnancy outcomes<sup>3</sup>",
        "Respiratory system": "Respiratory system",
        "Skin and mucous membrane, bone and joints system": "Skin and mucous membrane, bone and joints system",
        "All AESI categories": "All AESI categories",
        "Guillain-Barré Syndrome BCD 1-3": "Guillain-Barré Syndrome<sup>1</sup>",
        "Guillain-Barré Syndrome BCD 4": "Guillain-Barré Syndrome BCD* level 4<sup>2</sup>",
        "Thrombocytopenia (low blood platelets) BCD 1-3": "Thrombocytopenia (low blood platelets)<sup>1</sup>",
        "Thrombocytopenia (low blood platelets) BCD 4": "Thrombocytopenia (low blood platelets) BCD* level 4<sup>2</sup>",
        "Subtotal": "Subtotal",
        "Subtotal n (%)": "Subtotal",
        "TOTAL": "Total",
        "Cardiac arrest": "Cardiac arrest",
        "Cardiac failure": "Cardiac failure",
        "Multisystem inflammatory syndrome": "Multisystem inflammatory syndrome<sup>1</sup>",
        "Myalgia (muslce pain)": "Myalgia (muslce pain)",
        "Myalgia": "Myalgia",
        "Microangiopathy": "Microangiopathy",
        "Myocardial infarction (heart attack)": "Myocardial infarction (heart attack)",
        "Myocarditis (heart inflammation)": "Myocarditis/pericarditis",
        "Myocarditis": "Myocarditis",
        "Myocarditis/Pericarditis": "Myocarditis/Pericarditis",
        "Myocarditis/Pericarditis (inflammation of the heart muscle and lining around the heart) BCD 1-3": "Myocarditis/Pericarditis<sup>1</sup> (inflammation of the heart muscle and lining around the heart)",
        "Myocarditis/Pericarditis (inflammation of the heart muscle and lining around the heart) BCD 4": "Myocarditis<sup>2</sup>/Pericarditis (inflammation of the heart muscle and lining around the heart) BCD* level 4",
        "Stress cardiomyopathy": "Stress cardiomyopathy",
        "Cerebral venous (sinus) thrombosis": "Cerebral venous (sinus) thrombosis",
        "Cutaneous vasculitis": "Cutaneous vasculitis",
        "Deep vein thrombosis": "Deep vein thrombosis",
        "Embolism (artery blockage)": "Embolism (artery blockage)",
        "Embolism": "Embolism",
        "Unspecified COVID-19": "Unspecified COVID-19",
        "Haemorrhage (bleeding)": "Haemorrhage (bleeding)",
        "Pulmonary embolism": "Pulmonary embolism",
        "Thrombosis (blood clot)": "Thrombosis (blood clot)",
        "Thrombosis with thrombocytopenia syndrome (blood clot with low platelets) BCD 1-3": "Thrombosis with thrombocytopenia syndrome (blood clot with low platelets)<sup>1</sup>",
        "Thrombosis with thrombocytopenia syndrome (blood clot with low platelets) BCD 4": "Thrombosis with thrombocytopenia syndrome (blood clot with low platelets) BCD* level 4<sup>2</sup>",
        "Acute kidney injury": "Acute kidney injury",
        "Myocarditis/Pericarditis (inflammation of the heart muscle and lining around the heart)": "Myocarditis<sup>1</sup>/Pericarditis (inflammation of the heart muscle and lining around the heart)",
        "Liver injury": "Liver injury",
        "Cerebrovascular accident (stroke)": "Cerebrovascular accident (stroke)",
        "Generalized convulsion (seizure)": "Generalized convulsion (seizure)",
        "Transverse myelitis (inflammation of spinal cord)": "Transverse myelitis (inflammation of spinal cord)<sup>1</sup>",
        "COVID-19*": "COVID-19<sup>2</sup>",
        "Fetal growth restriction": "Fetal growth restriction",
        "Spontaneous abortion": "Spontaneous abortion",
        "Bell's Palsy*": "Bell's Palsy<sup>2</sup>",
        "Bell's Palsy/facial paralysis* BCD 1-3": "Bell's Palsy<sup>1</sup>/facial paralysis",
        "Bell's Palsy/facial paralysis* BCD 4": "Bell's Palsy<sup>2</sup>/facial paralysis BCD* level 4",
        "Acute respiratory distress syndrome": "Acute respiratory distress syndrome",
        "Chilblains": "Chilblains",
        "COVISHIELD/AstraZeneca (combined)": "COVISHIELD/AstraZeneca (combined)",
        "Erythema multiforme (immune skin reaction)": "Erythema multiforme (immune skin reaction)",
        "Number of Pfizer events": "Number of Pfizer Comirnaty events",
        "Number of Moderna events": "Number of Moderna Spikevax events",
        "Number of AstraZeneca/COVISHIELD events": "Number of AstraZeneca Vaxzevria/COVISHIELD events",
        "Number of Janssen JCOVDEN events": "Number of Janssen JCOVDEN events",
        "Number of Novavax Nuvaxovid events": "Number of Novavax Nuvaxovid events",
        "Number of Unspecified events": "Number of Unspecified events",
        "Total number of events": "Total number of events",
        "Total reporting rate per 100,000 doses administered": "Total reporting rate per 100,000 doses administered",
        "current-num-doses-admin": "current-num-doses-admin",
        "Reporting rate of Pfizer events per 100,000 doses administered": "Reporting rate of Pfizer events per 100,000 doses administered",
        "Reporting rate of Moderna events per 100,000 doses administered": "Reporting rate of Moderna Spikevax events per 100,000 doses administered",
        "Reporting rate of AstraZeneca/COVISHIELD events per 100,000 doses administered": "Reporting rate of AstraZeneca Vaxzevria/COVISHIELD events per 100,000 doses administered",
        "Reporting rate of Janssen events per 100,000 doses administered": "Reporting rate of Janssen events per 100,000 doses administered",
        "Reporting rate of Novavax events per 100,000 doses administered": "Reporting rate of Novavax events per 100,000 doses administered",
        "Reporting rate of Unspecified events per 100,000 doses administered": "Reporting rate of Unspecified events per 100,000 doses administered",
        "Number of Pfizer-BioNTech Comirnaty Bivalent (Original and Omicron BA.4/BA.5) events":"Number of Pfizer-BioNTech Comirnaty Bivalent (Original and Omicron BA.4/BA.5) events",
        "Number of Moderna Spikevax (Original/Omicron BA.1) bivalent events":"Number of Moderna Spikevax (Original/Omicron BA.1) Bivalent events",
        "Number of Moderna Spikevax (Original/Omicron BA.4/5) bivalent events":"Number of Moderna Spikevax (Original/Omicron BA.4/5) Bivalent events",
        "aesi-category": "aesi-category",
        "Glomerulonephritis (kidney inflammation) and nephrotic syndrome (kidney disorder)": "Glomerulonephritis (kidney inflammation) and nephrotic syndrome (kidney disorder)",
        "Rash generalized (non-allergic)": "Rash generalized (non-allergic)",
        "aesi": "aesi",
        "Circulatory system": "Circulatory system",
        "total-rate-all": "Total rate",
        "Jan COVID-19": "Jan COVID-19",
        "Fever GE 38°C": "Fever ≥ 38°C"
    }
    var shortLookupFR = {
        "Auto-immune diseases": "Maladies auto-immunes",
        "Cardiovascular system": "Système cardiovasculaire",
        "Circulatory system": "Système circulatoire sanguin",
        "Hepato-gastrointestinal and renal system": "Système hépato-gastro-intestinal et rénal",
        "Nerves and central nervous system": "Nerfs et système nerveux central",
        "Other system": "Autres systèmes",
        "Pregnancy outcomes": "Issues de grossesse<sup>3</sup>",
        "Respiratory system": "Système respiratoire",
        "Skin and mucous membrane, bone and joints system": "Peau et muqueuses, système osseux et articulations",
        "All AESI categories": "Toutes les catégories AESI",
        "Guillain-Barré Syndrome BCD 1-3": "Syndrome de Guillain-Barré<sup>1</sup>",
        "Guillain-Barré Syndrome BCD 4": "Syndrome de Guillain-Barré  BCD* niveau 4<sup>2</sup>",
        "Thrombocytopenia (low blood platelets) BCD 1-3": "Thrombocytopénie (faible taux de plaquettes)<sup>1</sup>",
        "Thrombocytopenia (low blood platelets) BCD 4": "Thrombocytopénie (faible taux de plaquettes) BCD* niveau 4<sup>2</sup>",
        "Subtotal": "Sous-total",
        "Subtotal n (%)": "Sous-total",
        "TOTAL": "Total",
        "Cardiac arrest": "Arrêt cardiaque",
        "Hypersensitivity": "Hypersensibilité",
        "Cardiac failure": "Insuffisance cardiaque",
        "Microangiopathy": "Microangiopathie",
        "Fever GE 38C": "Fièvre ≥ 38°C",
        "Myocarditis": "Myocardite",
        "Anaphylactic reaction": "Réaction anaphylactique",
        "Myocarditis/Pericarditis (inflammation of the heart muscle and lining around the heart) BCD 1-3": "Myocardite/Péricardite<sup>1</sup> (inflammation du cœur)",
        "Myocarditis/Pericarditis (inflammation of the heart muscle and lining around the heart) BCD 4": "Myocardite/Péricardite<sup>2</sup> (inflammation du cœur) BCD* niveau 4",
        "Myocardial infarction (heart attack)": "Infarctus du myocarde (crise cardiaque)",
        "Myocarditis (heart inflammation)": "Myocardite/péricardite",
        "Stress cardiomyopathy": "Myocardiopathie liée au stress",
        "Cerebral venous (sinus) thrombosis": "Thrombose veineuse cérébrale (sinus)",
        "Cutaneous vasculitis": "Vascularite cutanée",
        "Deep vein thrombosis": "Thrombose veineuse profonde",
        "Embolism (artery blockage)": "Embolie (occlusion artérielle)",
        "Embolism": "Embolie",
        "Oropharyngeal (throat) pain": "Douleur oropharyngée (gorge)",
        "Vaccination site pruitis (itching)": "Pruit au site de vaccination (démangeaisons)",
        "Haemorrhage (bleeding)": "Hémorragie (saignement)",
        "Pulmonary embolism (blood clot in lung)": "Embolie pulmonaire (caillot de sang dans les poumons)",
        "Pruritis (itching)": "Prurit (démangeaisons)",
        "Pulmonary embolism": "Embolie pulmonaire",
        "Jan COVID-19": "Jan COVID-19",
        "COVISHIELD/AstraZeneca (combined)": "COVISHIELD/AstraZeneca (combiné)",
        "Unspecified COVID-19": "Non spécifié COVID-19",
        "Myocarditis/pericarditis": "Myocardite/péricardite",
        "Myocarditis/Pericarditis": "Myocardite/péricardite",
        "Myocarditis/pericarditis*": "Myocardite/péricardite<sup>2</sup>",
        "Thrombosis (blood clot)": "Thrombose (caillot)",
        "Bell's Palsy/facial paralysis": "Paralysie de Bell/Paralysie faciale",
        "Bell's Palsy/facial paralysis*": "Paralysie de Bell<sup>1</sup>/Paralysie faciale",
        "Thrombosis with thrombocytopenia syndrome (blood clot with low platelets) BCD 1-3": "Syndrome de thrombose avec thrombocytopénie (caillot avec faible taux de plaquettes)<sup>1</sup>",
        "Thrombosis with thrombocytopenia syndrome (blood clot with low platelets) BCD 4": "Syndrome de thrombose avec thrombocytopénie (caillot avec faible taux de plaquettes) BCD* niveau 4<sup>2</sup>",
        "Thrombosis with thrombocytopenia syndrome (blood clot with low platelets)*": "Syndrome de thrombose avec thrombocytopénie<sup>1</sup> (caillot avec faible taux de plaquettes)",
        "Acute kidney injury": "Insuffisance rénale aiguë",
        "total-rate-all": "Taux total",
        "Liver injury": "Lésion du foie",
        "Cerebrovascular accident (stroke)": "Accident vasculaire cérébral  (AVC)",
        "Generalized convulsion (seizure)": "Convulsion généralisée (crise d’épilepsie) ",
        "Transverse myelitis (inflammation of spinal cord)": "Myélite transverse (Inflammation de la moelle épinière)<sup>1</sup>",
        "COVID-19*": "COVID-19<sup>2</sup>",
        "Fetal growth restriction": "Restriction de la croissance fœtale",
        "Spontaneous abortion": "Avortement spontané",
        "Acute respiratory distress syndrome": "Syndrome de détresse respiratoire aiguë",
        "Chilblains": "Engelures",
        "Multisystem inflammatory syndrome": "Syndrome inflammatoire multisystémique<sup>1</sup>",
        "Bell's Palsy": "Paralysie de Bell",
        "Bell's Palsy*": "Paralysie de Bell<sup>2</sup>",
        "Bell's Palsy/facial paralysis* BCD 1-3": "Paralysie de Bell<sup>1</sup>/Paralysie faciale",
        "Bell's Palsy/facial paralysis* BCD 4": "Paralysie de Bell<sup>2</sup>/Paralysie faciale BCD* niveau 4",
        "Erythema multiforme (immune skin reaction)": "Érythème multiforme (réaction cutanée immunitaire)",
        "Anaphylaxis": "Anaphylaxie",
        "Anaphylaxis*": "Anaphylaxie<sup>1</sup>",
        "Headache": "Mal de tête",
        "Severe allergic reaction": "Une réaction allergique sévère",
        "Facial paralysis": "Une paralysie faciale",
        "Dypshonia (hoarse voice)": "Dypshonie (voix rauque)",
        "Chills": "Frissons",
        "Syncope": "Une syncope",
        "Pain in extremity": "Douleurs aux extrémités",
        "Vaccination site reactions": "des réactions au site de vaccination",
        "Nausea": "des nausées",
        "Peripheral swelling": "Gonflement périphérique",
        "Show total doses administered": "Afficher le total des doses administrées",
        "Burning sensation": "Sensation de brûlure",
        "Palpitations": "Palpitations",
        "Hypersensitvity": "Hypersensibilité ",
        "Pharyngeal swelling (throat swelling)": "Enflure pharyngée (enflure de la gorge)",
        "Tachypnoea (abnormally rapid breathing)": "Tachypnée (respiration anormalement rapide)",
        "Paraesthesia": "de la paresthésie",
        "Total doses administered": "Doses totales administrées",
        "Pruritis": "un prurit",
        "Cerebral thrombosis": "Thrombose cérébrale",
        "Cov COVID-19": "Cov COVID-19",
        "Chest pain": "Douleur thoracique",
        "Urticaria": "de l'urticaire",
        "Throat irritation": "Irritation de la gorge",
        "Joint range of motion decreased": "Amplitude des mouvements articulaires diminuée",
        "Mod COVID-19": "Moderna Spikevax",
        "Moderna (Total)": "Spikevax Moderna (Total)",
        "Moderna (Dose 1)": "Spikevax Moderna (Dose 1)",
        "Moderna (Dose 2)": "Spikevax Moderna (Dose 2)",
        "Moderna (Dose 3)": "Spikevax Moderna (Dose 3)",
        "Moderna (Dose 4+)": "Spikevax Moderna (Dose 4+)",
        "Novavax (Total)": "Nuvaxovid Novavax (Total)",
        "Novavax (Dose 1)": "Nuvaxovid Novavax (Dose 1)",
        "Novavax (Dose 2)": "Nuvaxovid Novavax (Dose 2)",
        "Novavax (Dose 3)": "Nuvaxovid Novavax (Dose 3)",
        "Novavax (Dose 4+)": "Nuvaxovid Novavax (Dose 4+)",
        "Dysphonia (hoarse voice)": "Dysphonie (voix rauque)",
        "AstraZeneca/COVISHIELD (combined)": "Vaxzevria AstraZeneca/COVISHIELD",
        "COVISHIELD/AstraZeneca (Total)": "Vaxzevria AstraZeneca/COVISHIELD (Total)",
        "COVISHIELD/AstraZeneca (Dose 1)": "Vaxzevria AstraZeneca/COVISHIELD (Dose 1)",
        "COVISHIELD/AstraZeneca (Dose 2)": "Vaxzevria AstraZeneca/COVISHIELD (Dose 2)",
        "COVISHIELD/AstraZeneca (Dose 3)": "Vaxzevria AstraZeneca/COVISHIELD (Dose 3)",
        "COVISHIELD/AstraZeneca (Dose 4+)": "Vaxzevria AstraZeneca/COVISHIELD (Dose 4+)",
        "Unknown vaccine (Total)": "Vaccin inconnu (Total)",
        "Unknown vaccine (Dose 1)": "Vaccin inconnu (Dose 1)",
        "Unknown vaccine (Dose 2)": "Vaccin inconnu (Dose 2)",
        "Unknown vaccine (Dose 3)": "Vaccin inconnu (Dose 3)",
        "Unknown vaccine (Dose 4+)": "Vaccin inconnu (Dose 4+)",
        "Janssen Jcovden (Total)": "JCOVDEN de Janssen (Total)",
        "Janssen Jcovden (Dose 1)": "JCOVDEN de Janssen (Dose 1)",
        "Janssen Jcovden (Dose 2)": "JCOVDEN de Janssen (Dose 2)",
        "Janssen Jcovden (Dose 3)": "JCOVDEN de Janssen (Dose 3)",
        "Janssen Jcovden (Dose 4+)": "JCOVDEN de Janssen (Dose 4+)",
        "PB COVID-19": "Comirnaty Pfizer-BioNTech",
        "Pfizer-BioNTech (Total)": "Comirnaty Pfizer-BioNTech (Total)",
        "Pfizer-BioNTech (Dose 1)": "Comirnaty Pfizer-BioNTech (Dose 1)",
        "Pfizer-BioNTech (Dose 2)": "Comirnaty Pfizer-BioNTech (Dose 2)",
        "Pfizer-BioNTech (Dose 3)": "Comirnaty Pfizer-BioNTech (Dose 3)",
        "Pfizer-BioNTech (Dose 4+)": "Comirnaty Pfizer-BioNTech (Dose 4+)",
        "Comirnaty Original & Omicron BA.4/BA.5 Bivalent (Total)":"Vaccin bivalent Comirnaty de Pfizer-BioNTech (original et Omicron BA.4/BA.5) (Total)",
        "Comirnaty Original & Omicron BA.4/BA.5 Bivalent (Dose 1)":"Vaccin bivalent Comirnaty de Pfizer-BioNTech (original et Omicron BA.4/BA.5) (Dose 1)",
        "Comirnaty Original & Omicron BA.4/BA.5 Bivalent (Dose 2)":"Vaccin bivalent Comirnaty de Pfizer-BioNTech (original et Omicron BA.4/BA.5) (Dose 2)",
        "Comirnaty Original & Omicron BA.4/BA.5 Bivalent (Dose 3)":"Vaccin bivalent Comirnaty de Pfizer-BioNTech (original et Omicron BA.4/BA.5) (Dose 3)",
        "Comirnaty Original & Omicron BA.4/BA.5 Bivalent (Dose 4+)":"Vaccin bivalent Comirnaty de Pfizer-BioNTech (original et Omicron BA.4/BA.5) (Dose 4+)",
        "Moderna Spikevax (Original/OmicronBA.1) Bivalent (Total)":"Vaccin bivalent Spikevax de Moderna (original/Omicron BA.1) (Total)",
        "Moderna Spikevax (Original/OmicronBA.1) Bivalent (Dose 1)":"Vaccin bivalent Spikevax de Moderna (original/Omicron BA.1) (Dose 1)",
        "Moderna Spikevax (Original/OmicronBA.1) Bivalent (Dose 2)":"Vaccin bivalent Spikevax de Moderna (original/Omicron BA.1) (Dose 2)",
        "Moderna Spikevax (Original/OmicronBA.1) Bivalent (Dose 3)":"Vaccin bivalent Spikevax de Moderna (original/Omicron BA.1) (Dose 3)",
        "Moderna Spikevax (Original/OmicronBA.1) Bivalent (Dose 4+)":"Vaccin bivalent Spikevax de Moderna (original/Omicron BA.1) (Dose 4+)",
        "Moderna Spikevax (Original/OmicronBA.4/5) Bivalent (Total)":"Vaccin bivalent Spikevax de Moderna (original/Omicron BA.4/5) (Total)",
        "Moderna Spikevax (Original/OmicronBA.4/5) Bivalent (Dose 1)":"Vaccin bivalent Spikevax de Moderna (original/Omicron BA.4/5) (Dose 1)",
        "Moderna Spikevax (Original/OmicronBA.4/5) Bivalent (Dose 2)":"Vaccin bivalent Spikevax de Moderna (original/Omicron BA.4/5) (Dose 2)",
        "Moderna Spikevax (Original/OmicronBA.4/5) Bivalent (Dose 3)":"Vaccin bivalent Spikevax de Moderna (original/Omicron BA.4/5) (Dose 3)",
        "Moderna Spikevax (Original/OmicronBA.4/5) Bivalent (Dose 4+)":"Vaccin bivalent Spikevax de Moderna (original/Omicron BA.4/5) (Dose 4+)",
        "AZC COVID-19 (COVISHIELD)": "COVISHIELD",
        "AZC COVID-19": "Vaxzevria AstraZeneca",
        "AZC COVID-19 ": "Vaxzevria AstraZeneca",
        "Hypertension": "Hypertension",// (tension artérielle élevée) (elevated blood pressure)
        "Unknown": "Inconnu",
        "Total": "Total",
        "total": "cumulatif",
        "Rash generalized (non-allergic)": "Éruption cutanée généralisée (non allergique)",
        "monthly": "hebdomadaire",
        "monthly&rate": "hebdomadaire",
        "Chest discomfort": "Inconfort à la poitrine",
        "Hypoaesthesia": "l’hypoesthésie",
        "Hypoaesthesia oral": "l’hypoesthésie oral",
        "Oropharyngeal pain (throat pain)": "Douleur oropharyngienne (mal de gorge)",
        "Hypoaesthesia oral (numbness oral)": "Hypoesthésie orale (engourdissement oral)",
        "Pruritus": "Pruritus",
        "Myalgia (muslce pain)": "Myalgie (douleur musculaire)",
        "Myalgia": "Myalgie",
        "Dyspnoea": "la dyspnée",
        "Vaccination site pain": "Douleur au point d’injection",
        "Vaccintion site erythema (redness)": "Érythème au site de vaccination (rougeur)",
        "Vaccination site erythema (redness)": "Érythème au point d’injection (rougeur)",
        "Vaccination site swelling": "Enflure au point d’injection",
        "Vaccination site warmth": "Chaleur au point d’injection",
        "Vaccination site pruritus (itching)": "Prurit au point d’injection (démangeaison)",
        "Paraesthesia (tingling or prickling)": "Paresthésie (chatouillement ou picotement)",
        "Pruritus (itching)": "Prurit (démangeaisons)",
        "Headache": "Mal de tête",
        "Urticaria (hives)": "Urticaire (éruptions cutanées)",
        "Vaccination site reaction": "Réaction au point d’injection",
        "Nausea": "Nausée",
        "Vaccination site cellulitis": "Cellulite au point d’injection",
        "Vaccination site induration (hardening)": "Induration au point d’injection (durcissement)",
        "Dyspnoea (laboured breathing)": "Dyspnée (essoufflement)",
        "Rash": "Éruption cutanée",
        "Vaccination site rash": "Éruption cutanée au point d’injection",
        "Fatigue": "Fatigue",
        "Asthenia (weakness)": "Asthénie (la faiblesse)",
        "Hyperhidrosis (excessive sweating)": "Hyperhidrose (transpiration excessive)",
        "Swollen tongue": "Langue enflée",
        "Abdominal pain": "Douleurs abdominales",
        "Hypoaesthesia (numbness)": "Hypo-esthésie (engourdissement)",
        "Anaphylaxies": "Anaphylaxie",
        "Other allergic reactions": "Autres réactions allergiques",
        "Dizziness": "Étourdissements",
        "Adenopathy/lymphadenopathy (swollen lymph nodes)": "Enflure des ganglions lympthiques",
        "Adenopathy/lymphadenopathy": "Enflure des ganglions lympthiques",
        "Erythema (redness)": "Érythème (rougeur)",
        "Vomiting": "Vomissements",
        "Diarrhea": "Diarrhée",
        "Fever ≥ 38°C": "Fièvre ≥ 38°C",
        "Tachycardia (fast heartbeat)": "Tachycardie (pouls rapide)",
        "Tachycardia": "Tachycardie",
        "Throat tightness": "Serrement à la gorge",
        "Vaccination site induration (hardness)": "Induration au point d’injection (durcissement)",
        "Vaccination site inflammation": "Inflammation au point d'injection",
        "Myalgia (muscle pain)": "Myalgie (douleur musculaires)",
        "Pain": "Douleur",
        "Arthralgia (joint pain)": "Arthralgie (douleur aux articulations)",
        "Flushing": "Rougeurs au visage et au cou",
        "Malaise (discomfort)": "Malaise (inconfort)",
        "Feeling hot": "Sentiment de chaleur",
        "Lip swelling": "Gonflement des lèvres",
        "Malaise": "Malaise",
        "Cough": "Toux",
        "Dysphagia": "La dysphagie",
        "Swelling face": "Visage gonflé",
        "Anaphylaxis (BCD levels 1-3)": "Anaphylaxie (niveaux de BCD* 1-3)",
        "Vaccination site oedema": "Œdème au site de vaccination",
        "Dysphagia (difficulty swallowing)": "Dysphagie (difficulté à avaler)",
        "Extensive swelling of vaccinated limb": "Enflure étendue du membre vacciné",
        "Dermatitis allergic": "Dermatite allergique",
        "Glomerulonephritis (kidney inflammation) and nephrotic syndrome (kidney disorder)": "Glomérulonéphrite (inflammation des reins) et syndrome néphrotique (troubles rénaux)",
        "Non-serious reporting rate": "Taux sans gravité",
        "Serious reporting rate": "Taux grave",
        "total-rate": "Taux cumulatif",
        "Pfizer rate": "Taux Comirnaty Pfizer",
        "Moderna rate": "Taux Spikevax Moderna",
        "AstraZeneca/COVISHIELD rate": "Taux Vaxzevria AstraZeneca/COVISHIELD",
        "N/A": "s.o.",
        "Number of Pfizer events": "Nombre de MCI du vaccin Comirnaty Pfizer",
        "Number of Moderna events": "Nombre de MCI du vaccin Spikevax Moderna",
        "Number of AstraZeneca/COVISHIELD events": "Nombre de MCI du vaccin Vaxzevria AstraZeneca/COVISHIELD",
        "Number of Janssen JCOVDEN events": "Nombre de MCI du vaccin Janssen JCOVDEN",
        "Number of Novavax Nuvaxovid events": "Nombre de MCI du vaccin Nuvaxovid Novavax",
        "Number of Unspecified events": "Nombre de MCI du vaccin non precise",
        "Total number of events": "Nombre total",
        "Total reporting rate per 100,000 doses administered": "Taux total d’événements par 100 000 doses administrées",
        "current-num-doses-admin": "Nombre actuel de doses administrées",
        "Reporting rate of Pfizer events per 100,000 doses administered": "Taux de MCI du vaccin Comirnaty Pfizer par 100 000 doses administrées",
        "Reporting rate of Moderna events per 100,000 doses administered": "Taux de MCI du vaccin Spikevax Moderna par 100 000 doses administrées",
        "Reporting rate of AstraZeneca/COVISHIELD events per 100,000 doses administered": "Taux de MCI du vaccin Vaxzevria AstraZeneca/COVISHIELD par 100 000 doses administrées",
        "Reporting rate of Janssen events per 100,000 doses administered": "Taux de MCI du vaccin Janssen par 100 000 doses administrées",
        "Reporting rate of Novavax events per 100,000 doses administered": "Taux de MCI du vaccin Novavax par 100 000 doses administrées",
        "Reporting rate of Unspecified events per 100,000 doses administered": "Taux de MCI du vaccin Unspecified par 100 000 doses administrées",
        "Number of Pfizer-BioNTech Comirnaty Bivalent (Original and Omicron BA.4/BA.5) events":"Nombre de MCI du vaccin bivalent Comirnaty de Pfizer-BioNTech (original et Omicron BA.4/BA.5)",
        "Number of Moderna Spikevax (Original/Omicron BA.1) bivalent events":"Nombre de MCI du vaccin bivalent Spikevax de Moderna (original/Omicron BA.1)",
        "Number of Moderna Spikevax (Original/Omicron BA.4/5) bivalent events":"Nombre de MCI du vaccin bivalent Spikevax de Moderna (original/Omicron BA.4/5)",
        "aesi-category": "Catégorie de EIIP",
        "aesi": "EIIP",
        "Hypersensitivity": "Hypersensibilité",
        "Fever GE 38°C": "Fièvre ≥ 38°C"
    }
    if (language == "en") {
        return shortLookup[short];
    }
    else {
        return shortLookupFR[short];
    }
}

var csvfiles = [
    '/src/data/covidLive/vaccine-safety/vaccine-safety-keyupdates.csv',
    '/src/data/covidLive/vaccine-safety/vaccine-safety-figure1.csv',
    '/src/data/covidLive/vaccine-safety/vaccine-safety-figure2.csv',
    '/src/data/covidLive/vaccine-safety/vaccine-safety-figure3.csv',
    '/src/data/covidLive/vaccine-safety/vaccine-safety-AEFI-figure.csv',
    "/src/data/covidLive/vaccine-safety/vaccine-safety-AESIs-table.csv"
]

var promises = [];

csvfiles.forEach(function(url) {
    promises.push(d3.csv(url))
});

Promise.all(promises).then(function(values) {
    keyUpdates(values[0]);
    figure1(values[1]);
    figure2(values[2]);
    figure3(values[3]);
    figure4(values[4]);
    AESITable(values[5]);
    $("#AESITable-dropdown-measure").on("change", function(e) {
        AESITable(values[5]);
        //updateSelectOptions(5)
    });
    $("#AESITable2-dropdown-measure").on("change", function(e) {
        AESITable(values[5]);
        //updateSelectOptions(5)
    })
    $(document).ready(function() {
        setTimeout(function() {
            d3.selectAll(".descTable")
                .attr("class", "wb-tables table table-striped table-hover table-bordered")
                .attr("data-order", '[[0, "desc"]]')
                .attr("data-page-length", '10')
                .attr("data-length-menu", '[ 10, 25, 50, 75, 100 ]');

            d3.select("#figure1aTable")
                .attr("data-columns", '[{ "type": "date" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" }]');
            d3.select("#figure2Table")
                .attr("data-columns", '[{ "type": "string" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" }]');
            d3.select("#figure3Table")
                .attr("data-columns", '[{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" }]');
            d3.select("#figure4Table")
                .attr("data-columns", '[{ "type": "string" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" },{ "type": "num-fmt" }]');
            $(".wb-tables").trigger("wb-init.wb-tables");
            //disable ordering on french tables
            //data-wb-tables='{ "ordering" : false }'
        }, 500);
        // var queryStringValues = getParams(window.location.href);
        // if(Object.keys(queryStringValues).length > 1 ){
        //     $("#figure1-dropdown-measure").val(queryStringValues["f1"]["dd1"]).trigger('change');
        //     $("#figure1-dropdown-measure3").val(queryStringValues["f1"]["dd2"]).trigger('change');
        //     $("#figure2-dropdown-measure").val(queryStringValues["f2"]["dd1"]).trigger('change');
        //     $("#figure2-dropdown-measure2").val(queryStringValues["f2"]["dd2"]).trigger('change');
        //     $("#figure3-dropdown-measure2").val(queryStringValues["f3"]["dd1"]).trigger('change');
        //     $("#figure3-dropdown-measure").val(queryStringValues["f3"]["dd2"]).trigger('change');
        //     $("#figure4-dropdown-measure2").val(queryStringValues["f4"]["dd1"]).trigger('change');
        //     $("#figure4-dropdown-measure").val(queryStringValues["f4"]["dd2"]).trigger('change');
        //     $("#AESITable2-dropdown-measure").val(queryStringValues["f5"]["dd1"]).trigger('change');
        //     $("#AESITable-dropdown-measure").val(queryStringValues["f5"]["dd2"]).trigger('change');
        //     currentQueryString = 
        //         "fig=f1&dd1="+queryStringValues["f1"]["dd1"]+"&dd2="+queryStringValues["f1"]["dd2"]+
        //         "&fig=f2&dd1="+queryStringValues["f2"]["dd1"]+"&dd2="+queryStringValues["f2"]["dd2"]+
        //         "&fig=f3&dd1="+queryStringValues["f3"]["dd1"]+"&dd2="+queryStringValues["f3"]["dd2"]+
        //         "&fig=f4&dd1="+queryStringValues["f4"]["dd1"]+"&dd2="+queryStringValues["f4"]["dd2"]+
        //         "&fig=f5&dd1="+queryStringValues["f5"]["dd1"]+"&dd2="+queryStringValues["f5"]["dd2"];
        // }
    });
});

function keyUpdates(data) {
    var currentDate = data.length - 1;

    updateTime();
    updateKeyUpdates();

    function updateTime() {
        var formatTime = d3.timeFormat("%B %-d, %Y");
        var formatTimeFr = d3.timeFormat("%-d %B %Y")
        var formatTime3 = d3.timeFormat("%Y-%m-%d");
        var parseTime = d3.timeParse("%Y-%m-%d");

        var oneDayMillis = 1000 * 60 * 60 * 24;
        var sevenDaysBefore = new Date(parseTime(data[currentDate][""]) - (6 * oneDayMillis));

        $(".dateFrom").text(formatTime(sevenDaysBefore));
        if (language == "fr")
            d3.selectAll(".dateToShort").text(formatTimeFr(parseTime(data[currentDate]["data-cut-off-date"])));
        else
            d3.selectAll(".dateToShort").text(formatTime(parseTime(data[currentDate]["data-cut-off-date"])));
        if (language == "fr")
            d3.selectAll(".datePosted").text(formatTimeFr(parseTime(data[currentDate]["web-posting-date"])));
        else
            d3.selectAll(".datePosted").text(formatTime(parseTime(data[currentDate]["web-posting-date"])));

        $(".dateWeek").text(data[currentDate]["Week"]);
        $(".dateModified").text(formatTime3(parseTime(data[currentDate]["web-posting-date"])));
    }

    function updateKeyUpdates() {
        var totalAEFIs = +data[currentDate]["total"];
        var totalSeriousAEFIs = +data[currentDate]["serious"];
        var percentSeriousAEFIs = totalSeriousAEFIs / totalAEFIs * 100;
        var totalNonseriousAEFIs = +data[currentDate]["non-serious"];
        var percentNonseriousAEFIs = totalNonseriousAEFIs / totalAEFIs * 100;
        var newAEFIs = +data[currentDate]["new-since-last-posting"];
        var totalDoses = data[currentDate]["current-num-doses-admin"];
        var percentCoverageTotal = data[currentDate]["percent-total"];
        var percentCoverageSerious = data[currentDate]["percent-serious"];
        var percentCoverageNonSerious = data[currentDate]["percent-non-serious"];
        var currentWeekAEFIs = totalAEFIs / currentDate + 1;
        var percentSpacing = "";
        if (language == "fr") {
            percentSpacing = " ";
        }
        $(".totalAEFIs").text(numberFormat(totalAEFIs));
        $(".totalSeriousAEFIs").text(numberFormat(totalSeriousAEFIs));
        $(".percentSeriousAEFIs").text(numberFormat(percentSeriousAEFIs) + percentSpacing);
        $(".totalNonseriousAEFIs").text(numberFormat(totalNonseriousAEFIs));
        $(".percentNonseriousAEFIs").text(percentFormat(percentNonseriousAEFIs) + percentSpacing);
        $(".percentageDosesAdminTotal").text((language == "fr" ? percentCoverageTotal.replace(".", ",") : percentCoverageTotal));
        $(".percentageDosesAdminSerious").text((language == "fr" ? percentCoverageSerious.replace(".", ",") : percentCoverageSerious));
        $(".percentageDosesAdminNonSerious").text((language == "fr" ? percentCoverageNonSerious.replace(".", ",") : percentCoverageNonSerious));
        $(".newAEFIs").text(numberFormat(newAEFIs));
        $(".totalDoses").text(numberFormat(totalDoses));
        $(".totalDosesDate").text(formatTimeLong(parseTime(currentDate)));
        $(".currentWeekAEFIs").text(numberFormat(currentWeekAEFIs));
    }

    var vaccineType = $("#vaccine-type option:selected").text();
    $(".vaccine-type1").text(vaccineType);
    $(".vaccine-type2").text(vaccineType.toLowerCase());

    $("#vaccine-type").on("change", function(e) {
        if (this.value == "influenza") {
            vaccineType = "Influenza";
            $(".vaccine-type2").text(vaccineType.toLowerCase());
        }
        else {
            vaccineType = "COVID-19";
            $(".vaccine-type2").text(vaccineType);
        }

        $(".vaccine-type1").text(vaccineType);
    });

}

function figure1(data) {
    if (language == "en")
        formatTime = d3.timeFormat("%d-%b-%y");
    else
        formatTime = d3.timeFormat("%d-%b-%y");

    var currentDate = data[data.length - 1];

    var tableA = d3.select("#figure1aTable");

    $(".newSeriousAEFIs").text(numberFormat(currentDate["monthly-serious-all"]));
    $(".newNonSeriousAEFIs").text(numberFormat(currentDate["monthly-non-serious-all"]));

    tableA
        .append("tbody")
        .selectAll("tr")
        .data(data)
        .enter()
        .append("tr")
        .html(function(d) {
            var currDate = formatTime(new Date(parseTime(d["data-cut-off-date"])));
            var tableRow = "<td data-sort='" + d["data-cut-off-date"] + "'>" + (currDate) + "</td>";
            var skipColumns = ["data-cut-off-date", "web-posting-date",
                "cum-non-serious-rate-all", "cum-serious-rate-all",
                "cum-non-serious-rate-18plus", "cum-serious-rate-18plus",
                "cum-non-serious-rate-12to17", "cum-serious-rate-12to17",
                "cum-non-serious-rate-5to11", "cum-serious-rate-5to11",
                "total-all", "total-rate-all", "total-18plus", "total-rate-18plus",
                "total-12to17", "total-rate-12to17", "total-5to11", "total-rate-5to11"
            ];
            for (var key in d) {
                if (d.hasOwnProperty(key) && !skipColumns.includes(key)) {
                    if (d[key] % 1 == 0) {
                        if (language == "en")
                            tableRow += "<td data-sort='" + d[key].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d[key]).replace("NaN", "N/A") + "</td>";
                        else
                            tableRow += "<td data-sort='" + d[key].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d[key]).replace("NaN", "s.o.") + "</td>";
                    }
                    else {
                        if (language == "en")
                            tableRow += "<td data-sort='" + d[key].replace("N/A", -1).replace("s.o", -1) + "'>" + decimalFormat(d[key]).replace("NaN", "N/A") + "</td>";
                        else
                            tableRow += "<td data-sort='" + d[key].replace("N/A", -1).replace("s.o", -1) + "'>" + decimalFormat(d[key]).replace("NaN", "s.o.") + "</td>";
                    }
                }
            }
            return tableRow;
            // if (language == "en")
            //     return "<td>" + (currDate) + "</td><td>" + numberFormat(d["monthly-non-serious-all"]) + "</td><td>" + numberFormat(d["monthly-serious-all"]) + "</td><td>" + numberFormat(d["cum-non-serious-all"]) + "</td><td>" + numberFormat(d["cum-serious-all"]) + "</td><td>" + numberFormat(d["doses-admin-all"]).replace("NaN", "N/A") + "</td><td>" + numberFormat(d["monthly-doses-admin-all"]).replace("NaN", "N/A") + "</td><td>" + decimalFormat(d["monthly-non-serious-rate-all"]).replace("NaN", "N/A") + "</td><td>" + decimalFormat(d["monthly-serious-rate-all"]).replace("NaN", "N/A") + "</td><td>" + decimalFormat(d["monthly-total-rate-all"]).replace("NaN", "N/A") + "</td><td>" + decimalFormat(d["monthly-total-rate-all"]).replace("NaN", "N/A") + "</td><td>" + decimalFormat(d["monthly-total-rate-all"]).replace("NaN", "N/A") + "</td><td>" + decimalFormat(d["monthly-total-rate-all"]).replace("NaN", "N/A") + "</td><td>" + decimalFormat(d["monthly-total-rate-all"]).replace("NaN", "N/A") + "</td>";
            // else
            //     return "<td>" + (currDate) + "</td><td>" + numberFormat(d["monthly-non-serious-all"]) + "</td><td>" + numberFormat(d["monthly-serious-all"]) + "</td><td>" + numberFormat(d["cum-non-serious-all"]) + "</td><td>" + numberFormat(d["cum-serious-all"]) + "</td><td>" + numberFormat(d["doses-admin-all"]).replace("NaN", "s.o.") + "</td><td>" + numberFormat(d["monthly-doses-admin-all"]).replace("NaN", "s.o.") + "</td><td>" + decimalFormat(d["monthly-non-serious-rate-all"]).replace("NaN", "s.o.") + "</td><td>" + decimalFormat(d["monthly-serious-rate-all"]).replace("NaN", "s.o.") + "</td><td>" + decimalFormat(d["monthly-total-rate-all"]).replace("NaN", "s.o.") + "</td>";
        });

    $(".coveragePer100KTotal").text(language == "fr" ? (Number(currentDate["total-rate-all"]).toFixed(1)).replace(".", ",") : Number(currentDate["total-rate-all"]).toFixed(1));
    $(".coveragePer100KSerious").text(language == "fr" ? (Number(currentDate["cum-serious-rate-all"]).toFixed(1)).replace(".", ",") : Number(currentDate["cum-serious-rate-all"]).toFixed(1));
    //hardcoded because they remove the row for some reason
    //$(".nChange").text(language == "fr" ? (numberFormat(Number(51714).toFixed(1))).replace(".", ",") : numberFormat(Number(51714).toFixed(1)));

    var legendJSON = {};
    var keys1 = [];
    var colors = [];
    var selectKeys1 = {};
    var toggleTotalDoses = false;
    var svg;

    if (language == "en") {
        legendJSON = {
            "monthly-serious-all": "Serious",
            "monthly-non-serious-all": "Non Serious"
        };
    }
    else {
        legendJSON = {
            "monthly-non-serious-all": "Sans gravité",
            "monthly-serious-all": "Grave"
        };
    }
    keys1 = ["monthly-non-serious-all", "monthly-serious-all"];
    selectKeys1 = {
        "monthly-serious-all": "SeriousAEFIs",
        "monthly-non-serious-all": "NonSeriousAEFIs"
    }
    colors = ["#8c96c6", "#88419d"];
    svg = d3.select("#figure1div").select("#figure1");

    const margin = {
        top: 30,
        right: 85,
        bottom: 100,
        left: 75
    };

    var isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    var width = 1140 - margin.left - margin.right;
    var height = 520 - margin.top - margin.bottom;

    svg = svg
        .attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        })
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1140 580")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .range([height, 10]);

    var z = d3.scaleOrdinal()
        .range(colors);

    svg.append("g")
        .attr("class", "y-axis-2");

    svg.append("g")
        .attr("class", "x-axis-2");

    var xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title-2");

    var yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-2");

    var selectedBreakdown = null;
    x.domain(data.map(function(d, i) {
        return formatTime(parseTime(d["data-cut-off-date"]));
    }));

    z = d3.scaleOrdinal()
        .range(colors);

    z.domain(keys1);

    svg.select(".x-axis-2").attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", 13) //24
        .style("text-anchor", "end")
        .attr("transform", "rotate(-34)")
        .attr("x", 0)
        .attr("y", 10)
        .text(function(d) {
            return d;
        });

    svg.select(".x-axis-2")
        .selectAll(".tick line")
        .style("stroke", "black")
        .style("stroke-width", "2px");

    xAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en")
                return "Reports received";
            else
                return "Période de déclaration";
        });

    var yMax = [];
    data.map(function(d) {
        yMax.push(Number(d[keys1[0]]) + Number(d[keys1[1]]));
    })
    y.domain([0, 6150]);
    // y.domain([0, d3.max(yMax) + 150]);

    svg.select(".y-axis-2")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y).ticks(5))
        .selectAll(".tick")
        .style("font-size", 14)
        .select("line")
        .style("font-size", 12)
        .attr('x2', width)
        .selectAll("text")
        .style("font-size", 24)

    svg.select(".y-axis-2")
        .selectAll("text")
        .style("font-size", 15)

    yAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en")
                return "Number of reports";
            else
                return "Nombre de rapports";
        });

    var stack = d3.stack();
    //create stacked bakcground invisible doses
    svg.append("g")
        .attr("class", "backgroundG")
        .selectAll(".backgroundDoses")
        .data(data)
        .enter()
        .append("rect")
        .attr("class", "backgroundDoses")
        .attr("fill", "#CFB997")
        .attr("x", function(d) {
            if (x.bandwidth() > width / 5)
                return x(formatTime(parseTime(d["data-cut-off-date"]))) + 15;
            else
                return x(formatTime(parseTime(d["data-cut-off-date"])));
        })
        .attr("y", y(0))
        .attr("height", 0)
        .attr("width", function(d) {
            if (x.bandwidth() > width / 5)
                return width / 5;
            else
                return x.bandwidth();
        })
        .append("title")
        .text(function(d) {
            return "Total Doses administered: " + d["doses-admin-all"];
        });
    //appending stacked bars to figure1 
    svg.selectAll(".serie1")
        .data(stack.keys(keys1)(data))
        .enter()
        .append("g")
        .attr("class", function(d) {
            return "serie1 " + selectKeys1[d.key];
        })
        .on("click", function(d, i) {
            var j = i;
            if (i == 0)
                j = 1;
            else
                j = 0;
            if (keys1.length > 1) {
                isolate(data, selectKeys1, d.key, svg);
                if (d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + selectKeys1[d.key]).select("text").attr("class") == "removed") {
                    d3.selectAll(".serie1legend").selectAll("text").style("fill", "#333").attr("class", "added");
                    d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(d) { return z(d); }).attr("class", "added");
                }
                else if (d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").attr("class") == "added") {
                    d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").style("fill", "#bfbfbf").attr("class", "removed");
                    d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("rect").attr("fill", "#bfbfbf").attr("class", "removed");
                }
                else {
                    d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("text").style("fill", "#333").attr("class", "added");
                    d3.select(".serie1legend:not(." + selectKeys1[d.key] + ")").select("rect").attr("fill", function(d) { return z(d); }).attr("class", "added");
                }
            }
        })
        .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("x", function(d) {
            if (x.bandwidth() > width / 5)
                return x(formatTime(parseTime(d.data["data-cut-off-date"]))) + 15;
            else
                return x(formatTime(parseTime(d.data["data-cut-off-date"])));
        })
        .attr("y", function(d) { return y(d[1]); })
        .attr("height", function(d) { return y(d[0]) - y(d[1]); })
        .attr("width", function(d) {
            if (x.bandwidth() > width / 5)
                return width / 5;
            else
                return x.bandwidth();
        })
        .append("title")
        .text(function(d) {
            return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
        });
    //creation of g element for legend
    var legend = svg.append("g")
        .attr("class", "legendG")
        .attr("font-family", "sans-serif")
        .style("font-size", "22px")
        .attr("text-anchor", "start")
        .selectAll("g")
        .data(keys1.slice().reverse())
        .enter()
        .append("g")
        .attr("class", function(d) {
            return "serie1legend " + selectKeys1[d];
        })
        .attr("transform", function(d, i) { return "translate(" + Math.pow(-1, (i + 1)) * 100 + "," + 0 + ")"; });

    legend.append("rect")
        .on("click", function(d, i) {
            var j = i;
            if (i == 0)
                j = 1;
            else
                j = 0;
            if (keys1.length > 1) {
                isolate(data, selectKeys1, d, svg);
                if (d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + selectKeys1[d]).select("text").attr("class") == "removed") {
                    d3.selectAll(".serie1legend").selectAll("text").style("fill", "#333").attr("class", "added");
                    d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(d) { return z(d); }).attr("class", "added");
                }
                else if (d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added") {
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill", "#bfbfbf").attr("class", "removed");
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill", "#bfbfbf").attr("class", "removed");
                }
                else {
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill", "#333").attr("class", "added");
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill", function(d) { return z(d); }).attr("class", "added");
                }
            }
        })
        .on("keypress", function(d, i) {
            var j = i;
            if (i == 0)
                j = 1;
            else
                j = 0;
            if (keys1.length > 1) {
                isolate(data, selectKeys1, d, svg);
                if (d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + selectKeys1[d]).select("text").attr("class") == "removed") {
                    d3.selectAll(".serie1legend").selectAll("text").style("fill", "#333").attr("class", "added");
                    d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(d) { return z(d); }).attr("class", "added");
                }
                else if (d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added") {
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill", "#bfbfbf").attr("class", "removed");
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill", "#bfbfbf").attr("class", "removed");
                }
                else {
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill", "#333").attr("class", "added");
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill", function(d) { return z(d); }).attr("class", "added");
                }
            }
        })
        .attr("x", 430)
        .attr("y", 470)
        .attr("width", 20)
        .attr("height", 20)
        .attr("fill", function(d) { return z(d); })
        .attr("tabindex", 0)
        .style("stroke-width", "0.5px")
        .style("stroke", "black")
        .style("cursor", "pointer")
        .attr("class", "added")

    legend.append("text")
        .on("click", function(d, i) {
            var j = i;
            if (i == 0)
                j = 1;
            else
                j = 0;
            if (keys1.length > 1) {
                isolate(data, selectKeys1, d, svg);
                if (d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added" && d3.select(".serie1legend." + selectKeys1[d]).select("text").attr("class") == "removed") {
                    d3.selectAll(".serie1legend").selectAll("text").style("fill", "#333").attr("class", "added");
                    d3.selectAll(".serie1legend").selectAll("rect").attr("fill", function(d) { return z(d); }).attr("class", "added");
                }
                else if (d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").attr("class") == "added") {
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill", "#bfbfbf").attr("class", "removed");
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill", "#bfbfbf").attr("class", "removed");
                }
                else {
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("text").style("fill", "#333").attr("class", "added");
                    d3.select(".serie1legend:not(." + selectKeys1[d] + ")").select("rect").attr("fill", function(d) { return z(d); }).attr("class", "added");
                }
            }
        })
        .attr("x", 460)
        .attr("y", 480)
        .attr("dy", "0.4em")
        .text(function(d) { return legendJSON[d]; })
        .attr("class", "added");

    //Creation of line graph for total
    var y3 = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return parseFloat(d["doses-admin-all"].replace("N/A", 0)); }) + 10000000])
        .range([height, 0]);

    var lineTotalDoses = d3.line()
        .x(function(d) {
            return x(formatTime(parseTime(d["data-cut-off-date"]))) //+ x.bandwidth() / 2
            ;
        })
        .y(function(d) { return y3(parseFloat(d["doses-admin-all"].replace("N/A", 0))); });

    //Creation of line graph for monthly
    var y2 = d3.scaleLinear()
        .domain([0, d3.max(data, function(d) { return parseFloat(d["monthly-total-rate-all"].replace("N/A", 0)); }) + 35])
        .range([height, 0]);

    var lineSerious = d3.line()
        .x(function(d) { return x(formatTime(parseTime(d["data-cut-off-date"]))) + x.bandwidth() / 2; })
        .y(function(d) { return y2(parseFloat(d["monthly-serious-rate-all"].replace("N/A", 0))); });

    var lineNonSerious = d3.line()
        .x(function(d) { return x(formatTime(parseTime(d["data-cut-off-date"]))) + x.bandwidth() / 2; })
        .y(function(d) { return y2(parseFloat(d["monthly-non-serious-rate-all"].replace("N/A", 0))); });

    var lineTotal = d3.line()
        .x(function(d) { return x(formatTime(parseTime(d["data-cut-off-date"]))) + x.bandwidth() / 2; })
        .y(function(d) { return y2(parseFloat(d["monthly-total-rate-all"].replace("N/A", 0))); });

    svg.selectAll("path.totalLine")
        .data(data)
        .enter()
        .append("path")
        .attr("id", "totalDosesLine")
        .attr("class", "dosesLine")
        .attr("fill", "none")
        .attr("stroke", "#a9a9a9")
        .attr("stroke-miterlimit", 1)
        .attr("stroke-width", 6)
        .attr("d", function(d) {
            var dataIndex;
            for (var i = 0; i < data.length; i++) {
                if (data[i] == d)
                    dataIndex = i;
            }
            if (dataIndex + 1 !== data.length)
                return lineTotalDoses([d, data[dataIndex + 1]]);
            else
                return lineTotalDoses([d]);;
        })
        .style("opacity", 0)
        .append("title")
        .text(function(d) {
            return "Total Doses Administered : " + numberFormat(parseFloat(d["doses-admin-all"]));
        });

    svg.append("path")
        .attr("class", "monthlyLine")
        .attr("id", "lineSerious")
        .attr("fill", "none")
        .attr("stroke", "#F3FE2A")
        .attr("stroke-miterlimit", 1)
        .attr("stroke-width", 6)
        .attr("d", lineSerious(data))
        .style("opacity", 0);

    svg.append("path")
        .attr("class", "monthlyLine")
        .attr("id", "lineNonSerious")
        .attr("fill", "none")
        .attr("stroke", "#1BA761")
        .attr("stroke-miterlimit", 1)
        .attr("stroke-width", 6)
        .attr("d", lineNonSerious(data))
        .style("opacity", 0);

    svg.append("path")
        .attr("class", "monthlyLine")
        .attr("id", "lineTotal")
        .attr("fill", "none")
        .attr("stroke", "#0F0F0F")
        .attr("stroke-miterlimit", 1)
        .attr("stroke-width", 6)
        .attr("d", lineTotal(data))
        .style("opacity", 0);
    //Append second y axis title for rate
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 1030)
        .attr("x", -195)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-3")
        .text(function() {
            if (language == "en")
                return "Report rate per 100,000 doses administered";
            else
                return "Taux de rapports par 100 000 doses adminstrées";
        })
        .style("opacity", 0);
    //Append y axis to the right for total doeses
    svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 1045)
        .attr("x", -190)
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-4")
        .text(function() {
            if (language == "en")
                return "Total doses administered";
            else
                return "Doses totales administrées";
        })
        .style("opacity", 0);

    svg.append("g")
        .attr("class", "y-axis-4")
        .style("opacity", 0);

    svg.select(".y-axis-4")
        .call(d3.axisRight(y3).ticks(6))
        .attr("transform", "translate(" + width + ",0)")
        .selectAll(".tick")
        .style("font-size", 12)
        .selectAll("text")
        .style("font-size", 20);

    svg.append("g")
        .attr("class", "y-axis-3")
        .style("opacity", 0);

    svg.select(".y-axis-3")
        .call(d3.axisRight(y2).ticks(6))
        .attr("transform", "translate(" + width + ",0)")
        .selectAll(".tick")
        .style("font-size", 14)
        .selectAll("text")
        .style("font-size", 24);

    var lineLegend = svg.append("g")
        .attr("class", "lineLegendG")
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "start")
        .style("opacity", 0)
        .style("font-size", "22px")
        .selectAll("g")
        .data(["Serious reporting rate", "Non-serious reporting rate", "total-rate-all"])
        .enter()
        .append("g")
        .attr("transform", function(d, i) { return "translate(" + i * 362 + "," + 0 + ")"; });

    lineLegend.append("rect")
        .attr("x", 60)
        .attr("y", 515)
        .attr("width", 30)
        .attr("height", 8)
        .attr("fill", function(d) {
            if (d == "Non-serious reporting rate")
                return "#1BA761";
            else if (d == "Serious reporting rate")
                return "#F3FE2A";
            else
                return "#0F0F0F";
        })
        .style("stroke-width", "0.5px")
        .style("stroke", "black");

    lineLegend.append("text")
        .attr("x", 100)
        .attr("y", 520)
        .attr("dy", "0.3em")
        .text(function(d) { return short2txt(d); });

    lineLegend = svg.append("g")
        .attr("class", "lineLegendG2")
        .attr("font-family", "sans-serif")
        .attr("text-anchor", "start")
        .style("opacity", 0)
        .style("font-size", "22px")
        .selectAll("g")
        .data(["Total doses administered"])
        .enter()
        .append("g")
        .attr("transform", function(d, i) { return "translate(" + i * 100 + "," + 0 + ")"; });

    lineLegend.append("rect")
        .attr("x", 365)
        .attr("y", 515)
        .attr("width", 30)
        .attr("height", 8)
        .attr("fill", "#a9a9a9")
        .attr("id", "totalDosesLegend")
        .style("opacity", 0)
        .style("stroke-width", "0.5px")
        .style("stroke", "black");

    lineLegend.append("text")
        .style("opacity", 0)
        .attr("x", 410)
        .attr("y", 520)
        .attr("dy", "0.3em")
        .attr("id", "totalText")
        .text(function(d) { return short2txt(d); });

    lineLegend.append("rect")
        .attr("x", 46)
        .attr("y", 50)
        .attr("width", 20)
        .attr("height", 20)
        .attr("rx", 5)
        .attr("fill", "white")
        .style("stroke-width", "1px")
        .style("stroke", "black")
        .style("cursor", "pointer")
        .on("click", function() {
            toggleTotalDosesOpacity();
        });

    lineLegend.append("rect")
        .attr("id", "checkBoxFill")
        .attr("x", 50)
        .attr("y", 54)
        .attr("width", 12)
        .attr("height", 12)
        .attr("rx", 3)
        .attr("fill", "black")
        .style("opacity", 0)
        .style("cursor", "pointer")
        .on("click", function() {
            toggleTotalDosesOpacity();
        });

    lineLegend.append("text")
        .attr("x", 75)
        .attr("y", 60)
        .attr("dy", "0.3em")
        .style("cursor", "pointer")
        .text(short2txt("Show total doses administered"))
        .on("click", function() {
            toggleTotalDosesOpacity();
        });

    //overlap cube transparence
    svg.append("rect")
        .attr("x", 939)
        .attr("width", x.bandwidth() * 1.1)
        .attr("height", height)
        .attr("id", "overlapRect")
        .style("pointer-events", "none")
        .style("fill", "#a9a9a9")
        .style("opacity", 0.3);

    $("#figure1-dropdown-measure").on("change", function(e) {
        var measure2 = document.getElementById('figure1-dropdown-measure_2');
        var measure3 = document.getElementById('figure1-dropdown-measure3');
        // if (this.value == "rate" || this.value == "monthly&rate"){
        //     d3.select("#childrenFig1").style("display","none");
        //     if(($("#figure1-dropdown-measure3").val() == "5to11"))
        //         $("#figure1-dropdown-measure3").val("12to17");
        // }
        // else
        //     d3.select("#childrenFig1").style("display","inline");
        updateFigure1(data, this.value, measure2.options[measure2.selectedIndex].value, measure3.options[measure3.selectedIndex].value);
    });

    $("#figure1-dropdown-measure_2").on("change", function(e) {
        var measure1 = document.getElementById('figure1-dropdown-measure');
        updateFigure1(data, measure1.options[measure1.selectedIndex].value, this.value);
    });
    $("#figure1-dropdown-measure3").on("change", function(e) {
        let measure1 = document.getElementById('figure1-dropdown-measure');
        let measure2 = document.getElementById('figure1-dropdown-measure_2');
        //hardcoded because they remove the row for some reason
        let currTotalNumber;
        switch (this.value) {
            case "all":
                currTotalNumber = 53064;
                break;
            case "18plus":
                currTotalNumber = 49426;
                break;
            case "12to17":
                currTotalNumber = 1692;
                break;
            case "5to11":
                currTotalNumber = 761;
                break;
            case "0to4":
                currTotalNumber = 81;
                break;
        }

        $(".nChange").text(language == "fr" ?
            (numberFormat(Number(currTotalNumber).toFixed(1))).replace(".", ",") :
            numberFormat(Number(currTotalNumber).toFixed(1)));

        updateFigure1(data, measure1.options[measure1.selectedIndex].value, measure2.options[measure2.selectedIndex].value, this.value);
    });

    function toggleTotalDosesOpacity() {
        if (toggleTotalDoses) {
            toggleTotalDoses = false;
            d3.select(".y-axis-4").transition().duration(500).style("opacity", 0);
            d3.select("#checkBoxFill").style("opacity", 0);
            d3.select(".y-axis-title-4").transition().duration(500).style("opacity", 0);
            d3.selectAll(".dosesLine").transition().duration(500).style("opacity", 0);
            d3.select("#totalDosesLine").transition().duration(500).style("opacity", 0);
            d3.select("#totalDosesLegend").transition().duration(500).style("opacity", 0);
            d3.select("#totalText").transition().duration(500).style("opacity", 0);
        }
        else {
            toggleTotalDoses = true;
            d3.select(".y-axis-4").transition().duration(500).style("opacity", 1);
            d3.select("#checkBoxFill").style("opacity", 1);
            d3.select(".y-axis-title-4").transition().duration(500).style("opacity", 1);
            d3.selectAll(".dosesLine").transition().duration(500).style("opacity", 1);
            d3.select("#totalDosesLine").transition().duration(500).style("opacity", 1);
            d3.select("#totalDosesLegend").transition().duration(500).style("opacity", 1);
            d3.select("#totalText").transition().duration(500).style("opacity", 1);
        }
    }

    function isolate(data, keys1, key, svg) {
        if (selectedBreakdown != null) {

            var stack = d3.stack();
            var stacked = stack.keys(Object.keys(keys1).sort())(data);

            svg.selectAll(".serie1")
                .data(stacked)
                .selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .transition()
                .duration(500)
                .attr("y", function(d) { return y(d[1]); })
                .attr("height", function(d) { return y(d[0]) - y(d[1]); })
                .style("opacity", 1);

            selectedBreakdown = null;
        }
        else {
            selectedBreakdown = keys1[key];

            svg.select("." + selectedBreakdown)
                .selectAll("rect")
                .transition()
                .duration(500)
                .attr("y", function(d) {
                    return y(d.data[key]);
                });

            svg.selectAll(".serie1:not(." + selectedBreakdown + ")")
                .selectAll("rect")
                .transition()
                .duration(500)
                .style("opacity", 0);
        }
    }

    function updateFigure1(data, measure, measure2, measure3) {
        //updateSelectOptions("f1");

        var legendJSON = {};
        var keys1 = [];
        var colors = [];
        var svg;

        d3.select("#overlapRect").transition().duration(500).style("opacity", 0.3);
        d3.select(".legendG").transition().duration(500).style("opacity", 1);
        if (measure == "total") {
            //Remove linegraph stuff
            d3.selectAll(".monthlyLine").transition().duration(500).style("opacity", 0);
            d3.select(".y-axis-title-3").transition().duration(500).style("opacity", 0);
            d3.select(".y-axis-3").transition().duration(500).style("opacity", 0);
            d3.select(".lineLegendG").transition().duration(500).style("opacity", 0);

            d3.select(".NonSeriousAEFIs").transition().duration(500).style("opacity", 1);
            d3.select(".SeriousAEFIs").transition().duration(500).style("opacity", 1);
            d3.select(".legendG").transition().duration(500).style("opacity", 1);
            d3.select(".y-axis-title-2").transition().duration(500).style("opacity", 1);
            d3.select(".y-axis-2").transition().duration(500).style("opacity", 1);

            d3.select(".lineLegendG2").transition().duration(500).style("opacity", 1).style("pointer-events", "auto");
            if (toggleTotalDoses) {
                d3.select(".y-axis-title-4").transition().duration(500).style("opacity", 1);
                d3.selectAll(".dosesLine").transition().duration(500).style("opacity", 1);
                d3.select(".y-axis-4").transition().duration(500).style("opacity", 1);
            }
            else {
                d3.select(".y-axis-title-4").transition().duration(500).style("opacity", 0);
                d3.selectAll(".dosesLine").transition().duration(500).style("opacity", 0);
                d3.select(".y-axis-4").transition().duration(500).style("opacity", 0);
            }
            if (language == "en")
                document.getElementById("note").innerHTML = "<strong>Notes:</strong> Although the cumulative number of adverse event reports continues to increase over time, so does the number of doses administered. Up to and including December 9, 2022, all adverse event reports represented 0.057% of all doses administered.";
            else
                document.getElementById("note").innerHTML = "<strong>Remarque:</strong> Bien que le nombre cumulatif de rapports d'événements secondaires continue d'augmenter avec le temps, le nombre de doses administrées augmente également. En date du 11 décembre, 2022, les rapports d'événements indésirables représentaient 0,057% de toutes les doses administrées.";

            var cumSeriousKey = "cum-serious-" + measure3;
            var cumNonSeriousKey = "cum-non-serious-" + measure3;
            var cumSeriousRateKey = "cum-serious-rate-" + measure3;
            var cumNonSeriousRateKey = "cum-non-serious-rate-" + measure3;
            if (measure2 == "number") {
                if (language == "en") {
                    legendJSON = {};
                    legendJSON[cumSeriousKey] = "Serious";
                    legendJSON[cumNonSeriousKey] = "Non Serious";
                }
                else {
                    legendJSON = {};
                    legendJSON[cumNonSeriousKey] = "Sans gravité";
                    legendJSON[cumSeriousKey] = "Grave";
                }
                keys1 = [cumNonSeriousKey, cumSeriousKey];
                selectKeys1 = {};
                selectKeys1[cumSeriousKey] = "SeriousAEFIs";
                selectKeys1[cumNonSeriousKey] = "NonSeriousAEFIs";
            }
            else {
                if (language == "en") {
                    legendJSON = {};
                    legendJSON[cumSeriousRateKey] = "Serious";
                    legendJSON[cumNonSeriousRateKey] = "Non Serious";
                }
                else {
                    legendJSON = {};
                    legendJSON[cumNonSeriousRateKey] = "Sans gravité";
                    legendJSON[cumSeriousRateKey] = "Grave";
                }
                keys1 = [cumNonSeriousRateKey, cumSeriousRateKey];
                selectKeys1 = {};
                selectKeys1[cumSeriousRateKey] = "SeriousAEFIs";
                selectKeys1[cumNonSeriousRateKey] = "NonSeriousAEFIs";
            }
        }
        else {

            document.getElementById("note").innerHTML = "";

            if (measure == "rate" || measure == "monthly&rate") {
                //Remove line graph
                d3.selectAll(".monthlyLine").transition().duration(500).style("opacity", 1);
                d3.select(".y-axis-title-3").transition().duration(500).style("opacity", 1);
                d3.select(".y-axis-3").transition().duration(500).style("opacity", 1);
                d3.select(".lineLegendG").transition().duration(500).style("opacity", 1);
            }
            else {
                d3.select("#figure1").selectAll("path").transition().duration(500).style("opacity", 0);
                d3.select(".y-axis-title-3").transition().duration(500).style("opacity", 0);
                d3.select(".y-axis-3").transition().duration(500).style("opacity", 0);
                d3.select(".lineLegendG").transition().duration(500).style("opacity", 0);
            }

            d3.select(".y-axis-4").transition().duration(500).style("opacity", 0);
            d3.select(".lineLegendG2").transition().duration(500).style("opacity", 0).style("pointer-events", "none");
            d3.select(".y-axis-title-4").transition().duration(500).style("opacity", 0);
            d3.selectAll(".dosesLine").transition().duration(500).style("opacity", 0);

            var monthlySeriousKey = "monthly-serious-" + measure3;
            var monthlyNonSeriousKey = "monthly-non-serious-" + measure3;
            var monthlySeriousRateKey = "monthly-serious-rate-" + measure3;
            var monthlyNonSeriousRateKey = "monthly-non-serious-rate-" + measure3;
            if (measure2 == "number") {
                if (language == "en") {
                    legendJSON = {};
                    legendJSON[monthlySeriousKey] = "Serious AEFIs";
                    legendJSON[monthlyNonSeriousKey] = "Non Serious AEFIs";
                }
                else {
                    legendJSON = {};
                    legendJSON[monthlyNonSeriousKey] = "Grave";
                    legendJSON[monthlySeriousKey] = "Sans gravité";
                }
                keys1 = [monthlyNonSeriousKey, monthlySeriousKey];
                selectKeys1 = {};
                selectKeys1[monthlySeriousKey] = "SeriousAEFIs";
                selectKeys1[monthlyNonSeriousKey] = "NonSeriousAEFIs";
            }
            else {
                if (language == "en") {
                    legendJSON = {};
                    legendJSON[monthlySeriousRateKey] = "Serious AEFIs";
                    legendJSON[monthlyNonSeriousRateKey] = "Non Serious AEFIs";
                }
                else {
                    legendJSON = {};
                    legendJSON[monthlyNonSeriousRateKey] = "Grave";
                    legendJSON[monthlySeriousRateKey] = "Sans gravité";
                }
                keys1 = [monthlyNonSeriousRateKey, monthlySeriousRateKey];
                selectKeys1 = {};
                selectKeys1[monthlySeriousRateKey] = "SeriousAEFIs";
                selectKeys1[monthlyNonSeriousRateKey] = "NonSeriousAEFIs";
            }
        }
        colors = ["#8c96c6", "#88419d"];
        svg = d3.select("#figure1div").select("#figure1");

        x.domain(data.map(function(d) {
            return formatTime(parseTime(d["data-cut-off-date"]));
        }));

        z.domain(keys1);

        svg.select(".x-axis-2").attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", 13)
            .style("text-anchor", "end")
            .attr("x", 0)
            .attr("y", 10)
            .text(function(d) {
                return d;
            });

        svg.select(".x-axis-2")
            .selectAll(".tick line")
            .style("stroke", "black")
            .style("stroke-width", "2px")

        xAxisTitle
            .transition()
            .duration(500)
            .text(function() {
                if (language == "en")
                    return "Reporting period";
                else
                    return "Période de déclaration";
            });

        var yMax = [];
        data.map(function(d) {
            yMax.push(Number(d[keys1[0]]) + Number(d[keys1[1]]));
        });

        if (measure == "total")
            //y.domain([0, d3.max(yMax) + 5100]);
            y.domain([0, 55000]);
        else {
            //y.domain([0, d3.max(yMax) + 150]);
            y.domain([0, 6150]);
        }

        svg.select(".y-axis-2")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y).ticks(5))
            .selectAll(".tick")
            .style("font-size", 14)
            .select("line")
            .style("font-size", 12)
            .attr('x2', width);

        svg.select(".y-axis-2")
            .selectAll("text")
            .style("font-size", 15)

        yAxisTitle
            .transition()
            .duration(500)
            .text(function() {
                if (language == "en") {
                    if (measure.includes("monthly"))
                        return "Number of reports"
                    return short2txt(measure) + " number of reports";
                }
                else {
                    if (measure.includes("monthly"))
                        return "Nombre de rapports";
                    return "Nombre " + short2txt(measure) + " de rapports";
                }
            });

        var stack = d3.stack();

        var serie1 = svg.selectAll(".serie1")
            .data(stack.keys(keys1)(data))
            .attr("class", function(d, i) {
                return "serie1 " + selectKeys1[d.key];
            });

        if (measure3 == "12to17" || measure3 == "18plus") {
            data = data.filter(function(d) {
                return d["data-cut-off-date"] >= "2021-04-16" && d["data-cut-off-date"];
            });
            //CHANGE THIS LATER IF NEEDED
        }
        else if (measure3 == "5to11") {
            data = data.filter(function(d) {
                return d["data-cut-off-date"] >= "2021-11-25" && d["data-cut-off-date"];
            });
        }
        else if (measure3 == "0to4") {
            data = data.filter(function(d) {
                return d["data-cut-off-date"] >= "2022-07-10" && d["data-cut-off-date"];
            });
        }

        //Creation of line graph for total
        var y3 = d3.scaleLinear()
            .domain([0, 110000000])
            .range([height, 0]);

        var lineTotalDoses = d3.line()
            .x(function(d) {
                return x(formatTime(parseTime(d["data-cut-off-date"]))) + x.bandwidth() / 2;
            })
            .y(function(d) { return y3(parseFloat(d["doses-admin-" + measure3].replace("N/A", 0))); });

        //Creation of line graph for monthly

        var y2 = d3.scaleLinear()
            .domain([0, 300])
            .range([height, 0]);

        var lineSerious = d3.line()
            .x(function(d) { return x(formatTime(parseTime(d["data-cut-off-date"]))) + x.bandwidth() / 2; })
            .y(function(d) { return y2(parseFloat(d["monthly-serious-rate-" + measure3].replace("N/A", 0))); });

        var lineNonSerious = d3.line()
            .x(function(d) { return x(formatTime(parseTime(d["data-cut-off-date"]))) + x.bandwidth() / 2; })
            .y(function(d) { return y2(parseFloat(d["monthly-non-serious-rate-" + measure3].replace("N/A", 0))); });

        var lineTotal = d3.line()
            .x(function(d) { return x(formatTime(parseTime(d["data-cut-off-date"]))) + x.bandwidth() / 2; })
            .y(function(d) { return y2(parseFloat(d["monthly-total-rate-" + measure3].replace("N/A", 0))); });

        d3.selectAll("#totalDosesLine")
            .transition()
            .duration(500)
            .attr("d", lineTotalDoses(data))
            .style("opacity", function() {
                if (measure == "total" && toggleTotalDoses)
                    return 1;
                return 0;
            })
            .selectAll("title")
            .text(function(d) {
                return "Total Doses Administered : " + numberFormat(parseFloat(d["doses-admin-" + measure3]));
            })

        d3.select("#lineSerious")
            .transition()
            .duration(500)
            .attr("d", lineSerious(data))
            .style("opacity", function() {
                if (measure == "rate" || measure == "monthly&rate")
                    return 1;
                return 0;
            });

        d3.select("#lineNonSerious")
            .transition()
            .duration(500)
            .attr("d", lineNonSerious(data))
            .style("opacity", function() {
                if (measure == "rate" || measure == "monthly&rate")
                    return 1;
                return 0;
            });

        d3.select("#lineTotal")
            .transition()
            .duration(500)
            .attr("d", lineTotal(data))
            .style("opacity", function() {
                if (measure == "rate" || measure == "monthly&rate")
                    return 1;
                return 0;
            });

        svg.select(".y-axis-4")
            .transition()
            .duration(500)
            .call(d3.axisRight(y3).ticks(6))
            .style("opacity", function() {
                if (measure == "total" && toggleTotalDoses) {
                    return 1;
                }
                else {
                    return 0;
                }
            })
            .selectAll(".tick")
            .style("font-size", 14)
            .select("line")
            .style("font-size", 24);

        svg.select(".y-axis-4")
            .selectAll("text")
            .style("font-size", 12.2)

        svg.select(".y-axis-3")
            .transition()
            .duration(500)
            .call(d3.axisRight(y2).ticks(6))
            .style("opacity", function() {
                if (measure == "rate" || measure == "monthly&rate")
                    return 1;
                return 0;
            })
            .attr("transform", "translate(" + width + ",0)")
            .selectAll(".tick")
            .style("font-size", 14)
            .selectAll("text")
            .style("font-size", 24);

        svg.select(".y-axis-3")
            .selectAll("text")
            .style("font-size", 15);

        if (measure == "rate") {
            d3.select(".legendG").transition().duration(500).style("opacity", 0);
            d3.select(".y-axis-3").transition().duration(500).style("opacity", 0);
            d3.select(".y-axis-title-3").transition().duration(500).style("opacity", 0);

            //change the left hand axis
            yAxisTitle.transition().duration(500).text(function() {
                if (language == "en")
                    return "Report rate per 100,000 doses administered";
                else
                    return "Taux de rapports par 100 000 doses adminstrées";
            });

            svg.select(".y-axis-2")
                .transition()
                .duration(500)
                .call(d3.axisLeft(y2).ticks(6))
                .selectAll(".tick")
                .style("font-size", 14)
                .select("line")
                .style("font-size", 24)
                .attr('x2', width);

            svg.select(".y-axis-2")
                .selectAll("text")
                .style("font-size", 15)
            //update current bars on figure1
            serie1.selectAll("rect")
                .data(function(d) { return d; })
                .transition()
                .duration(700)
                .attr("y", 390)
                .attr("height", 0)
                .selectAll("title")
                .text(function(d) {
                    return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
                });
        }
        else {
            //update current bars on figure1
            serie1.selectAll("rect")
                .data(function(d) { return d; })
                .transition()
                .duration(700)
                .attr("y", function(d) {
                    if (isNaN(d[1]))
                        return y(0);
                    return y(d[1]);
                })
                .attr("height", function(d) {
                    if (isNaN(d[1]))
                        return y(0) - y(0);
                    return y(d[0]) - y(d[1]);
                })
                .selectAll("title")
                .text(function(d, i) {
                    return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
                });
        }

        legend = d3.selectAll(".legendG")
            .selectAll("g")
            .data(keys1.slice().reverse())
            .attr("class", function(d) {
                return "serie1legend " + selectKeys1[d];
            })
    }
}

function figure2(data) {
    data.forEach(function(d) {
        d["vaccine-name"] = short2txt(d["vaccine-name"]);
    });
    
    var currentDate = data.length - 1;
    var currentDate2 = data[currentDate]["data-cut-off-date"];
    var dataCurrentDate = data.filter(function(d) { return d["data-cut-off-date"] == currentDate2 });
    dataCurrentDate = dataCurrentDate.filter(function(d) { return d["vaccine-name"] !== "Total" && d["vaccine-name"] !== undefined; });
    $(".nChange2").text(language == "fr" ? (numberFormat(Number(data[currentDate]["total-all"]).toFixed(1))).replace(".", ",") : numberFormat(Number(data[currentDate]["total-all"]).toFixed(1)));

    var tableB = d3.select("#figure2Table");
    tableB
        .append("tbody")
        .selectAll("tr")
        .data(dataCurrentDate)
        .enter()
        .append("tr")
        .html(function(d) {
            var tableRow = "";
            var skipColumns = ["data-cut-off-date", "web-posting-date"];
            for (var key in d) {
                if (d.hasOwnProperty(key) && !skipColumns.includes(key)) {
                    if (key == "vaccine-name") {
                        if (d["vaccine-name"].includes("Total"))
                            tableRow += "<td>" + d["vaccine-name"] + "<sup>1</sup>" + "</td>";
                        else if (d["vaccine-name"].includes("Dose 1"))
                            tableRow += "<td>" + d["vaccine-name"] + "</td>";
                        else
                            tableRow += "<td>" + d["vaccine-name"] + "</td>";
                    }
                    else if (d[key] % 1 == 0) {
                        if (language == "en")
                            tableRow += "<td data-sort='" + d[key].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d[key]).replace("NaN", "N/A") + "</td>";
                        else
                            tableRow += "<td data-sort='" + d[key].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d[key]).replace("NaN", "s.o.") + "</td>";
                    }
                    else {
                        if (language == "en")
                            tableRow += "<td data-sort='" + d[key].replace("N/A", -1).replace("s.o", -1) + "'>" + decimalFormat(d[key]).replace("NaN", "N/A") + "</td>";
                        else
                            tableRow += "<td data-sort='" + d[key].replace("N/A", -1).replace("s.o", -1) + "'>" + decimalFormat(d[key]).replace("NaN", "s.o.") + "</td>";
                    }
                }
            }
            return tableRow;
        });

    updateTime();
    updateVaccineTypeUpdates();

    function updateTime() {
        var formatTime = d3.timeFormat("%B %-d, %Y");
        var formatTime2 = d3.timeFormat("%B %-d, %Y, %-I %p EDT");
        var formatTime3 = d3.timeFormat("%Y-%m-%d");
        var parseTime = d3.timeParse("%Y-%m-%d");
        var parseTime2 = d3.timeParse("%Y-%m-%d %H:%M");

        var oneDayMillis = 1000 * 60 * 60 * 24;
        var sevenDaysBefore = new Date(parseTime(data[currentDate]["data-cut-off-date"]) - (6 * oneDayMillis));
        $(".dateFromAgeSex").text(formatTime(sevenDaysBefore));
        $(".dateToShortAgeSex").text(formatTime(parseTime(data[currentDate]["data-cut-off-date"])));
        $(".dateToLong").text(formatTime2(parseTime2(data[0]["DateTo"])));
        $(".dateWeekAgeSex").text(data[currentDate]["Week"]);
        $(".dateModifiedAgeSex").text(formatTime3(parseTime(data[currentDate]["data-cut-off-date"])));
    }

    function updateVaccineTypeUpdates() {
        var sortedVacTypeData = data.sort(function(a, b) {
            return parseFloat(b.SeriousAEFIs) - parseFloat(a.SeriousAEFIs);
        });
        var totalAEFIReportsNonSerious = d3.sum(data, function(d, i) { return d["non-serious"]; });
        var totalAEFIReportsSerious = d3.sum(data, function(d, i) { return d["serious"]; });
        var totalAEFIReports = totalAEFIReportsNonSerious + totalAEFIReportsSerious;
        var firstHighestVacType = sortedVacTypeData[0];
        var secondHighestVacType = sortedVacTypeData[1];

        $(".firstHighestVacType").text("" + firstHighestVacType["vaccine-name"] + "; (" + (firstHighestVacType["non-serious"] + firstHighestVacType["serious"]) + " of " + totalAEFIReports + ")");
        $(".secondHighestVacType").text("" + secondHighestVacType["vaccine-name"] + "; (" + (secondHighestVacType["non-serious"] + secondHighestVacType["serious"]) + " of " + totalAEFIReports + ")");

        $(".highestRateVacType").text("");
        $(".highestNumberOfAEFIReports").text("" + firstHighestVacType["vaccine-name"]);
    }
   
    if (language == "en") {
        legendJSON = {
            "serious-all": "Serious",
            "non-serious-all": "Non-Serious"
        };
    }
    else {
        legendJSON = {
            "serious-all": "Grave",
            "non-serious-all": "Sans gravité"
        };
    }
    keys1 = ["non-serious-all", "serious-all"];
    selectKeys1 = {
        "serious-all": "SeriousAEFIs",
        "non-serious-all": "NonSeriousAEFIs"
    }

    // colors = ["#72577A", "#88419D","#AC52C7","#D766FA","#EAB2FB","black"];
    colors = ["#8c96c6", "#88419d"];
    var svg = d3.select("#figure2");

    const margin = {
        top: 100,
        right: 20,
        bottom: 100,
        left: 105
    };

    var isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    var width = 1140 - margin.left - margin.right;
    var height = 530 - margin.top - margin.bottom;

    svg = svg
        .attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        })
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox","0 80 1140 500")
        .append("g")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var selectedBreakdown = null;

    var x = d3.scaleBand()
        .range([0, width])
        .padding(0.1);

    var y = d3.scaleLinear()
        .range([height, 0]);

    var z = d3.scaleOrdinal()
        .range(colors);

    svg.append("g")
        .attr("class", "y-axis-2");

    svg.append("g")
        .attr("class", "x-axis-2");

    var xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top - 5) + ")")
        .style("text-anchor", "middle")
        .style("font-size", "22px")
        .attr("class", "x-axis-title-2");

    var yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "21px")
        .attr("class", "y-axis-title-2");
    //sorting data by dose    
    let clonedData = JSON.parse(JSON.stringify(dataCurrentDate));
    clonedData = clonedData.filter(function(d){
        return d["vaccine-name"].includes("Total")
    });

    x.domain(clonedData.map(function(d) {
        return d["vaccine-name"];
    }));

    z = d3.scaleOrdinal()
        .range(colors);

    z.domain([]);

    svg.select(".x-axis-2")
        .attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x))
        .selectAll("text")
        .style("font-size", "12.5px")
        .style("text-anchor", "middle")
        .text(function(d) {
            return d.substring(0, d.indexOf("(T")-1);
        }).call(wrap,100);

    svg.select(".x-axis-2")
        .selectAll(".tick line")
        .style("stroke", "black")
        .style("stroke-width", "2px");

    xAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en")
                return "Vaccine name";
            return "Nom du vaccin";
        });

    // y.domain([0, Math.ceil(d3.max(dataCurrentDate, function(d) {
    //     return +d["non-serious-all"];
    // }) * 1.8)]);

    y.domain([0, 26500]);

    svg.select(".y-axis-2")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y).ticks(5))
        .selectAll(".tick")
        .style("font-size", 14)
        .select("line")
        .style("font-size", 12)
        .attr('x2', width)
        .selectAll("text")
        .style("font-size", 15)

    svg.select(".y-axis-2")
        .selectAll("text")
        .style("font-size", 15)

    yAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en")
                return "Number of reports";
            return "Nombre de rapports";
        });

    var stack = d3.stack();

    svg.selectAll(".serie1")
        .data(stack.keys(keys1)(clonedData))
        .enter()
        .append("g")
        .attr("class", function(d, i) {
            return "serie1 " + selectKeys1[d.key];
        })
        // .on("click", function(d) {
        //     if (keys1.length > 1)
        //         isolate(dataCurrentDate, selectKeys1, d.key, svg);
        // })
        .attr("fill", function(d) {
            return z(d.key);
        })
        .selectAll("rect")
        .data(function(d) {
            return d;
        })
        .enter()
        .append("rect")
        .attr("fill", function(d) {
            if (d.data["vaccine-name"].includes("Total") && d["0"] !== 0)
                return "#703681";
            else if (d.data["vaccine-name"].includes("Total") && d["0"] == 0)
                return "#6975B5";
        })
        .attr("x", function(d) {
            var extraSpacing = 0;
            if (this.parentNode.__data__.key.includes("non-serious"))
                extraSpacing = -10;
            else
                extraSpacing = 15;
                
            return x(d.data["vaccine-name"]) + 35 + extraSpacing;
        })
        .attr("y", function(d) {
            if (isNaN(d[1]))
                return 0;
            if (this.parentNode.__data__.key.includes("non-serious"))
                return y(d[1])
            else
                return y(d.data[this.parentNode.__data__.key]);
        })
        .attr("height", function(d) {
            return y(d[0]) - y(d[1]);
        })
        .attr("width", function(d) {
            return x.bandwidth() / 4;
        })
        .append("title")
        .text(function(d, i) {
            return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
        });

    var legend = svg.append("g")
        .attr("class", "legendG")
        .attr("font-family", "sans-serif")
        .style("font-size", "22px")
        .attr("text-anchor", "start")
        .attr("transform", "translate(-965,40)")
        .selectAll("g")
        .data(keys1.reverse().slice())
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + ((((width - margin.left) - 710) * i) + 890) + "," + 0 + ")"; });

    legend.append("rect")
        .attr("x", 430)
        .attr("y", 400)
        .attr("width", 19)
        .attr("height", 19)
        // .on("click", function(d) {
        //     if (keys1.length > 1)
        //         isolate(dataCurrentDate, selectKeys1, d, svg);
        // })
        .attr("fill", function(d) { return z(d); })
        .style("stroke-width", "0.5px")
        .style("stroke", "black");

    legend.append("text")
        .attr("x", 455)
        .attr("y", 410)
        .attr("dy", "0.4em")
        .attr("class","legendText")
        .text(function(d) { return legendJSON[d] + " Total"; });

    var numRateToggle = true;
    var measure = document.getElementById('figure2-dropdown-measure');
    var measure2 = document.getElementById('figure2-dropdown-measure2');
    var measure3 = document.getElementById('figure2-dropdown-measure3');
    $("#figure2-dropdown-measure").on("change", function(e) {
        if (($("#figure2-dropdown-measure2").val() == "0to4") && numRateToggle)
            $("#figure2-dropdown-measure2").val("5to11");
            
        if (numRateToggle) {
            numRateToggle = false;
            $("#noRate").css("display", "none");
        }
        else {
            numRateToggle = true;
            $("#noRate").css("display", "inline");
        }

        updateFigure2(this.value, measure2.options[measure2.selectedIndex].value, measure3.options[measure3.selectedIndex].value);
    });

    $("#figure2-dropdown-measure2").on("change", function() {
        if (this.value == "0to4")
            $("#rate").css("display", "none");
        else
            $("#rate").css("display", "inline");
            
        updateFigure2(measure.options[measure.selectedIndex].value, this.value, measure3.options[measure3.selectedIndex].value);
        
        $(".nChange2").text(language == "fr" ? (numberFormat(Number(data[currentDate]["total-" + this.value]).toFixed(1))).replace(".", ",") : numberFormat(Number(data[currentDate]["total-" + this.value]).toFixed(1)));
    });

    $("#figure2-dropdown-measure3").on("change", function() {
        updateFigure2(measure.options[measure.selectedIndex].value, measure2.options[measure2.selectedIndex].value, this.value);
    });

    function isolate(data, keys1, key, svg) {
        if (selectedBreakdown != null) {

            var stack = d3.stack();
            var stacked = stack.keys(Object.keys(keys1).sort())(data);

            svg.selectAll(".serie1")
                .data(stacked)
                .selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .transition()
                .duration(500)
                .attr("y", function(d) {
                    if (isNaN(d[1]))
                        return y(0);
                    return y(d[1]);
                })
                .attr("height", function(d) {
                    if (isNaN(d[1]))
                        return y(0) - y(0);
                    return y(d[0]) - y(d[1]);
                })
                .style("opacity", 1);

            selectedBreakdown = null;
        }
        else {
            selectedBreakdown = keys1[key];

            svg.select("." + selectedBreakdown)
                .selectAll("rect")
                .transition()
                .duration(500)
                .attr("y", function(d) {
                    if (isNaN(d.data[key]))
                        return y(0);
                    return y(d.data[key]);
                });

            svg.selectAll(".serie1:not(." + selectedBreakdown + ")")
                .selectAll("rect")
                .transition()
                .duration(500)
                .style("opacity", 0);
        }
    }
    //temp N/As for dose 3 and Jassan vaccine of figure 3
    function updateFigure2(measure, measure2, measure3) {
        //updateSelectOptions("f2")
        var legendJSON = {};
        var keys1 = [];
        var colors = [];
        var svg;
        var filteredData;

        var seriousKey = "serious-" + measure2;
        var nonSeriousKey = "non-serious-" + measure2;
        var seriousRateKey = "serious-rate-" + measure2;
        var nonSeriousRateKey = "non-serious-rate-" + measure2;
        if (measure == "number") {
            if (language == "en") {
                legendJSON = {};
                legendJSON[seriousKey] = "Serious";
                legendJSON[nonSeriousKey] = "Non-Serious";
            }
            else {
                legendJSON = {};
                legendJSON[seriousKey] = "Grave";
                legendJSON[nonSeriousKey] = "Sans gravité";
            }
            keys1 = ["non-serious-" + measure2, "serious-" + measure2];
            selectKeys1 = {};
            selectKeys1[seriousKey] = "SeriousAEFIs";
            selectKeys1[nonSeriousKey] = "NonSeriousAEFIs";
            filteredData = dataCurrentDate;
        }
        else {
            if (language == "en") {
                legendJSON = {};
                legendJSON[seriousRateKey] = "Serious";
                legendJSON[nonSeriousRateKey] = "Non-Serious";
            }
            else {
                legendJSON = {};
                legendJSON[seriousRateKey] = "Grave";
                legendJSON[nonSeriousRateKey] = "Sans gravité";
            }
            keys1 = ["non-serious-rate-" + measure2, "serious-rate-" + measure2];
            selectKeys1 = {};
            selectKeys1[seriousRateKey] = "SeriousAEFIs";
            selectKeys1[nonSeriousRateKey] = "NonSeriousAEFIs";
            filteredData = dataCurrentDate.filter(function(d) {
                return !d["vaccine-name"].includes("Unknown") && !d["vaccine-name"].includes("Novavax") && !d["vaccine-name"].includes("inconnu");
            });
        }
        colors = ["#8c96c6", "#88419d"];
        svg = d3.select("#figure2");
        
        filteredData = filteredData.filter(function(d){
            return d["vaccine-name"].includes(measure3)
        });
    
        x.domain(filteredData.map(function(d) {
            return d["vaccine-name"];
        }));

        z.domain(keys1);
        
        svg.selectAll(".legendText")
        .text(function(d) { return (d.includes("non-serious") ? "Non-Serious":"Serious") + " "+measure3; });
        
        svg.select(".x-axis-2")
            .attr("transform", "translate(0," + height + ")")
            .call(d3.axisBottom(x))
            .selectAll("text")
            .style("font-size", function(){
                if (measure == "rate")
                    return "14.5px";
                return "12.5px";
            })
            .style("text-anchor", "middle")
            .text(function(d) {
                if(d.includes(measure3))
                    return d.substring(0, d.indexOf("("+measure3+")"));
            }).call(wrap,100);


        svg.select(".x-axis-2")
            .selectAll(".tick line")
            .style("stroke", "black")
            .style("stroke-width", "2px")
            .attr("x", 50);

        if (measure == "number")
            y.domain([0, 27000]);
        // y.domain([0, Math.ceil(d3.max(dataCurrentDate, function(d) {
        //     return +d["non-serious-"+measure2];
        // }) * 1.8)]);
        else
            y.domain([0, 225]);
        // y.domain([0, Math.ceil(d3.max(dataCurrentDate, function(d) {
        //     return +d["non-serious-rate-"+measure2];
        // }) * 2)]);
        svg.select(".y-axis-2")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y).ticks(5))
            .selectAll(".tick")
            .style("font-size", 14)
            .select("line")
            .style("font-size", 12)
            .attr('x2', width);

        svg.select(".y-axis-2")
            .selectAll("text")
            .style("font-size", 15)

        yAxisTitle
            .text(function() {
                if (measure == "number")
                    if (language == "en") {
                        return "Number of reports";
                    }
                else {
                    return "Nombre de rapports";
                }
                else
                if (language == "en") {
                    return "Rate of reports per 100,000 doses administered";
                }
                else
                    return "Taux de rapports d’effets secondaires par 100,000 doses administrées";

            }).call(wrapVertical, 300);

        var serie1 = svg.selectAll(".serie1")
            .data(stack.keys(keys1)(filteredData))
            .attr("class", function(d, i) {
                return "serie1 " + selectKeys1[d.key];
            });

        serie1.selectAll("rect")
            .transition()
            .duration(600)
            .style("opacity", function(d) {
                if ((d.data["vaccine-name"].includes("Unknown") ||
                        d.data["vaccine-name"].includes("inconnu") || d.data["vaccine-name"].includes("Novavax")) && measure == "rate")
                    return 0;
                return 1;
            });

        d3.selectAll(".placeholderText")
            .transition()
            .duration(500)
            .style("opacity", 0)
            .remove();

        serie1.selectAll("rect")
            .data(function(d) { return d; })
            .transition()
            .duration(700)
            .style("opacity", 1)
            .attr("x", function(d) {
                var extraSpacing = 0;
                if (measure == "number") {
                        // if(measure3 == "Dose 4+")
                        //     extraSpacing += -25;
                        
                        if (this.parentNode.__data__.key.includes("non-serious"))
                            extraSpacing = -25;
                        else
                            extraSpacing = 0;
                    return x(d.data["vaccine-name"]) + 50 + extraSpacing;
                }
                else {
                    // if(measure3 == "Dose 4+")
                    //         extraSpacing += -25;
                    if (this.parentNode.__data__.key.includes("non-serious"))
                        extraSpacing = -18;
                    else
                        extraSpacing = 14;

                    return x(d.data["vaccine-name"]) + 50 + extraSpacing;
                }
            })
            .attr("y", function(d) {
                if (isNaN(d[1]))
                    return y(0)
                if (this.parentNode.__data__.key.includes("non-serious"))
                    return y(d[1])
                else
                    return y(d.data[this.parentNode.__data__.key]);
            })
            .attr("width", function() {
                return x.bandwidth() / 4;
            })
            .attr("height", function(d) {
                if (isNaN(d[1]) && d.data["vaccine-name"].includes(measure3)) {
   
                    var NAText = d3.select("#figure2")
                        .append("text")
                        .attr("x", x(d.data["vaccine-name"]) + (measure == "number" ? 140 : 155) )
                        .attr("y", 420)
                        .attr("class", "placeholderText")
                        .style("font-size", "18px")
                        .style("font-weight", "bold")
                        .style("opacity", 0)
                        .text(short2txt("N/A"));
                       
                    NAText.transition().duration(500).style("opacity", 1);
                    
                    return y(0) - y(0);
                }
                return y(d[0]) - y(d[1]);

            })
            .select("title")
            .text(function(d) {
                return legendJSON[this.parentNode.parentNode.__data__.key] + ": " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
            });
    }
}

function figure3(data) {
    var currentDate = data.length - 1;
    var currentDate2 = data[currentDate]["data-cut-off-date"];
    var dataCurrentDate = data.filter(function(d) { return d["data-cut-off-date"] == currentDate2 });

    var table = d3.select("#figure3Table");
    var ageGroupOrder = [
        "0 to 4", // 0
        "5 to 11", // 1
        "12 to 17", // 2
        "18 to 29", // 3
        "30 to 39", // 4
        "40 to 49", // 5
        "50 to 59", // 6
        "60 to 69", // 7
        "70 to 79", // 7
        "80+", // 8
        "Unknown" // 9
    ];

    table
        .append("tbody")
        .selectAll("tr")
        .data(dataCurrentDate.filter(function(d) {
            return d["total"] !== "";
        }))
        .enter()
        .append("tr")
        .attr("id", function(d) {
            if (d["age-group"] == "Total")
                return "allAgeGroup"
            return ""
        })
        .html(function(d) {
            //temp 0 - 11 n/a change
            if (d["age-group"] == "Total")
                return "<td>" + "All age groups" + "</td><td data-sort='" + d["total"].replace("N/A", -1).replace("s.o", -1) + "'>" + d["total"] + "</td><td data-sort='" + d["male"].replace("N/A", -1).replace("s.o", -1) + "'>" + d["male"] + "</td><td data-sort='" + d["female"].replace("N/A", -1).replace("s.o", -1) + "'>" + d["female"] + "</td><td data-sort='" + d["other"].replace("N/A", -1).replace("s.o", -1) + "'>" + d["other"] + "</td><td data-sort='" + d["unknown"].replace("N/A", -1).replace("s.o", -1) + "'>" + d["unknown"] + "</td><td data-sort='" + numberFormat(d["doses-admin-age-group"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-age-group"]) + "</td><td data-sort='" + numberFormat(d["doses-admin-male"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male"]) + "</td><td data-sort='" + numberFormat(d["doses-admin-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-female"]) + "</td><td data-sort='" + numberFormat(d["rate-age-group"]).replace("NaN", -1) + "'>" + numberFormat(d["rate-age-group"]) + "</td><td data-sort='" + numberFormat(d["doses-admin-male-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male-female"]) + "</td><td data-sort='" + numberFormat(d["rate-male"]).replace("NaN", -1) + "'>" + d["rate-male"] + "</td><td data-sort='" + numberFormat(d["rate-female"]).replace("NaN", -1) + "'>" + numberFormat(d["rate-female"]) + "</td><td data-sort='" + numberFormat(d["rate-male-female"]).replace("NaN", -1) + "'>" + d["rate-male-female"] + "</td>";
            else
            if (language == "en")
                if (d["age-group"] == "12 to 17")
                    return "<td data-sort='" + ageGroupOrder.indexOf(d["age-group"]) + "'>" + d["age-group"] + "</td><td data-sort='" + d["total"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["total"]) + "</td><td data-sort='" + d["male"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["male"]) + "</td><td data-sort='" + d["female"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["female"]) + "</td><td data-sort='" + d["other"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["other"]) + "</td><td data-sort='" + d["unknown"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["unknown"]) + "</td><td data-sort='" + numberFormat(d["doses-admin-age-group"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-age-group"]) + "</td><td data-sort='" + numberFormat(d["doses-admin-male"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male"]) + "</td><td data-sort='" + numberFormat(d["doses-admin-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-female"]) + "</td><td data-sort='" + numberFormat(d["doses-admin-male-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male-female"]) + "</td><td data-sort='" + numberFormat(d["rate-age-group"]).replace("NaN", -1) + "'>" + d["rate-age-group"] + "</td><td data-sort='" + numberFormat(d["rate-male"]).replace("NaN", -1) + "'>" + d["rate-male"] + "</td><td data-sort='" + numberFormat(d["rate-female"]).replace("NaN", -1) + "'>" + d["rate-female"] + "</td><td data-sort='" + numberFormat(d["rate-male-female"]).replace("NaN", -1) + "'>" + d["rate-male-female"] + "</td>";
                else if (d["age-group"] == "0 to 4")
                return "<td data-sort='" + ageGroupOrder.indexOf(d["age-group"]) + "'>" + d["age-group"] + "<td data-sort='" + d["total"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["total"]).replace("NaN", "N/A") + "</td><td data-sort='" + d["male"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["male"]).replace("NaN", "N/A") + "</td><td data-sort='" + d["female"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["female"]).replace("NaN", "N/A") + "</td><td data-sort='" + d["other"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["other"]).replace("NaN", "N/A") + "</td><td data-sort='" + d["unknown"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["unknown"]).replace("NaN", "N/A") + "</td><td data-sort='" + numberFormat(d["doses-admin-age-group"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-age-group"]).replace("NaN", "N/A") + "</td><td data-sort='" + numberFormat(d["doses-admin-male"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male"]).replace("NaN", "N/A") + "</td><td data-sort='" + numberFormat(d["doses-admin-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-female"]).replace("NaN", "N/A") + "</td><td data-sort='" + numberFormat(d["doses-admin-male-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male-female"]).replace("NaN", "N/A") + "</td><td data-sort='" + numberFormat(d["rate-age-group"]).replace("NaN", -1) + "'>" + d["rate-age-group"] + "</td><td data-sort='" + numberFormat(d["rate-male"]).replace("NaN", -1) + "'>" + d["rate-male"] + "</td><td data-sort='" + numberFormat(d["rate-female"]).replace("NaN", -1) + "'>" + d["rate-female"] + "</td><td data-sort='" + numberFormat(d["rate-male-female"]).replace("NaN", -1) + "'>" + d["rate-male-female"] + "</td>";
            else
                return "<td data-sort='" + ageGroupOrder.indexOf(d["age-group"]) + "'>" + d["age-group"] + "</td><td data-sort='" + d["total"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["total"]).replace("NaN", "N/A") + "</td><td data-sort='" + d["male"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["male"]).replace("NaN", "N/A") + "</td><td data-sort='" + d["female"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["female"]).replace("NaN", "N/A") + "</td><td data-sort='" + d["other"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["other"]).replace("NaN", "N/A") + "</td><td data-sort='" + d["unknown"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["unknown"]).replace("NaN", "N/A") + "</td><td data-sort='" + numberFormat(d["doses-admin-age-group"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-age-group"]).replace("NaN", "N/A") + "</td><td data-sort='" + numberFormat(d["doses-admin-male"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male"]).replace("NaN", "N/A") + "</td><td data-sort='" + numberFormat(d["doses-admin-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-female"]).replace("NaN", "N/A") + "</td><td data-sort='" + numberFormat(d["doses-admin-male-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male-female"]).replace("NaN", "N/A") + "</td><td data-sort='" + numberFormat(d["rate-age-group"]).replace("NaN", -1) + "'>" + d["rate-age-group"] + "</td><td data-sort='" + numberFormat(d["rate-male"]).replace("NaN", -1) + "'>" + d["rate-male"] + "</td><td data-sort='" + numberFormat(d["rate-female"]).replace("NaN", -1) + "'>" + d["rate-female"] + "</td><td data-sort='" + numberFormat(d["rate-male-female"]).replace("NaN", -1) + "'>" + d["rate-male-female"] + "</td>";
            else
            if (d["age-group"] == "12 to 17")
                return "<td data-sort='" + ageGroupOrder.indexOf(d["age-group"]) + "'>" + d["age-group"].replace("to", "à").replace("Unknown", "Inconnu") + "</td><td data-sort='" + d["total"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["total"]) + "</td><td data-sort='" + d["male"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["male"]) + "</td><td data-sort='" + d["female"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["female"]) + "</td><td data-sort='" + d["other"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["other"]) + "</td><td data-sort='" + d["unknown"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["unknown"]) + "</td><td data-sort='" + numberFormat(d["doses-admin-age-group"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-age-group"]) + "</td><td data-sort='" + numberFormat(d["doses-admin-male"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male"]) + "</td><td data-sort='" + numberFormat(d["doses-admin-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-female"]) + "</td><td data-sort='" + numberFormat(d["doses-admin-male-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male-female"]) + "</td><td data-sort='" + numberFormat(d["rate-age-group"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-age-group"]) + "</td><td data-sort='" + numberFormat(d["rate-male"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-male"]) + "</td><td data-sort='" + numberFormat(d["rate-female"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-female"]) + "</td><td data-sort='" + numberFormat(d["rate-male-female"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-male-female"]) + "</td>";
            else if (d["age-group"] == "0 to 4")
                return "<td data-sort='" + ageGroupOrder.indexOf(d["age-group"]) + "'>" + d["age-group"].replace("to", "à").replace("Unknown", "Inconnu") + "</td><td data-sort='" + d["total"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["total"]).replace("NaN", "s.o.") + "</td><td data-sort='" + d["male"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["male"]).replace("NaN", "s.o.") + "</td><td data-sort='" + d["female"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["female"]).replace("NaN", "s.o.") + "</td><td data-sort='" + d["other"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["other"]).replace("NaN", "s.o.") + "</td><td data-sort='" + d["unknown"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["unknown"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["doses-admin-age-group"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-age-group"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["doses-admin-male"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["doses-admin-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-female"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["doses-admin-male-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male-female"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["rate-age-group"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-age-group"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["rate-male"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-male"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["rate-female"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-female"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["rate-male-female"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-male-female"]).replace("NaN", "s.o.") + "</td>";
            else
                return "<td data-sort='" + ageGroupOrder.indexOf(d["age-group"]) + "'>" + d["age-group"].replace("to", "à").replace("Unknown", "Inconnu") + "</td><td data-sort='" + d["total"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["total"]).replace("NaN", "s.o.") + "</td><td data-sort='" + d["male"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["male"]).replace("NaN", "s.o.") + "</td><td data-sort='" + d["female"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["female"]).replace("NaN", "s.o.") + "</td><td data-sort='" + d["other"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["other"]).replace("NaN", "s.o.") + "</td><td data-sort='" + d["unknown"].replace("N/A", -1).replace("s.o", -1) + "'>" + numberFormat(d["unknown"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["doses-admin-age-group"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-age-group"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["doses-admin-male"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["doses-admin-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-female"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["doses-admin-male-female"]).replace("NaN", -1) + "'>" + numberFormat(d["doses-admin-male-female"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["rate-age-group"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-age-group"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["rate-male"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-male"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["rate-female"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-female"]).replace("NaN", "s.o.") + "</td><td data-sort='" + numberFormat(d["rate-male-female"]).replace("NaN", -1) + "'>" + decimalFormat(d["rate-male-female"]).replace("NaN", "s.o.") + "</td>";

        });
    d3.select("#allAgeGroup").remove();

    updateTime();
    updateAgeSexUpdates();

    function updateTime() {
        var formatTime = d3.timeFormat("%B %-d, %Y");
        var formatTime2 = d3.timeFormat("%B %-d, %Y, %-I %p EDT");
        var parseTime = d3.timeParse("%Y-%m-%d");
        var parseTime2 = d3.timeParse("%Y-%m-%d %H:%M");

        var oneDayMillis = 1000 * 60 * 60 * 24;
        var sevenDaysBefore = new Date(parseTime(data[currentDate]["data-cut-off-date"]) - (6 * oneDayMillis));
        $(".dateFromAgeSex").text(formatTime(sevenDaysBefore));
        $(".dateToShortAgeSex").text(formatTime(parseTime(data[currentDate]["data-cut-off-date"])));
        $(".dateToLong").text(formatTime2(parseTime2(data[0]["DateTo"])));
        $(".dateWeekAgeSex").text(data[currentDate]["Week"]);
    }

    function updateAgeSexUpdates() {
        var dataCurrentDateAge = dataCurrentDate.filter(function(d) { return d["age-group"] != "Total"; });
        var highestAgeGroupIndex = maxIndex(dataCurrentDateAge.map(function(d) { return parseFloat(d["total"]); }));

        if (dataCurrentDateAge[highestAgeGroupIndex]["age-group"] == "18 to <50")
            var highestAgeGroup = "18 to 49";
        else
            var highestAgeGroup = dataCurrentDateAge[highestAgeGroupIndex]["age-group"];

        if (language == "fr")
            highestAgeGroup = highestAgeGroup.replace("to", "à") + " ans";

        var dataCurrentDateTotal = dataCurrentDate.filter(function(d) { return d["age-group"] == "Total"; });
        var sexTotalAEFIs = +dataCurrentDateTotal[0]["total"];
        var femaleAEFIs = +dataCurrentDateTotal[0]["female"];
        var maleAEFIs = +dataCurrentDateTotal[0]["male"];
        var highestSex;
        var lowestSex;
        if (language == "en") {
            if (femaleAEFIs > maleAEFIs) {
                highestSex = "females";
                lowestSex = "males";
            }
            else {
                highestSex = "males";
                lowestSex = "females";
            }
        }
        else {
            if (femaleAEFIs > maleAEFIs) {
                highestSex = "femmes";
                lowestSex = "hommes";
            }
            else {
                highestSex = "hommes";
                lowestSex = "femmes";
            }
        }

        $(".highestAgeGroup").text(highestAgeGroup);
        $(".highestSex").text(highestSex);
        $(".lowestSex").text(lowestSex);
        $(".percentHighestSex").text(d3.format(".1f")((femaleAEFIs / sexTotalAEFIs) * 100));

        var dataCurrentDateUnder18 = dataCurrentDate.filter(function(d) { return (d["age-group"] != "Total") && (d["age-group"] != "18 to <65 years") && (d["age-group"] != "65+ years"); });
        var dataCurrentDateOver18 = dataCurrentDate.filter(function(d) { return (d["age-group"] == "18 to <65 years") || (d["age-group"] == "65+ years"); });
        var totalGenderUnder18 = d3.sum(dataCurrentDateUnder18, function(d) { return d["total"]; });
        var malesUnder18 = d3.sum(dataCurrentDateUnder18, function(d) { return d["male"]; });
        var malesOver18 = d3.sum(dataCurrentDateOver18, function(d) { return d["male"]; });
        var femalesUnder18 = d3.sum(dataCurrentDateUnder18, function(d) { return d["female"]; });
        var femalesOver18 = d3.sum(dataCurrentDateOver18, function(d) { return d["female"]; });

        var highestSexUnder18;
        var highestSexOver18;

        if (femalesUnder18 > malesUnder18)
            highestSexUnder18 = (language == "en" ? "females" : "femmes");
        else
            highestSexUnder18 = (language == "en" ? "males" : "hommes");

        if (femalesOver18 > malesOver18)
            highestSexOver18 = (language == "en" ? "females" : "femmes");
        else
            highestSexOver18 = (language == "en" ? "males" : "hommes");

        $(".highestSexUnder18").text(highestSexUnder18);
        if (femalesUnder18 > malesUnder18) {
            $(".percentHighestSexUnder18").text(d3.format(".1f")(((femalesUnder18) / totalGenderUnder18) * 100));
        }
        else {
            $(".percentHighestSexUnder18").text(d3.format(".1f")(((malesUnder18) / totalGenderUnder18) * 100));
        }

        $(".highestSexOver18").text(highestSexOver18);
        if (femalesOver18 > malesOver18) {
            $(".percentHighestSexUnder18").text(d3.format(".1f")(((femalesOver18) / totalGenderUnder18) * 100));
        }
        else {
            $(".percentHighestSexUnder18").text(d3.format(".1f")(((malesOver18) / totalGenderUnder18) * 100));
        }
    }
    var legendJSONCategory;

    if (language == "en") {
        legendJSONCategory = {
            "male": "Male",
            "female": "Female",
            "other": "Other",
            "unknown": "Unknown"
        };
    }
    else {
        legendJSONCategory = {
            "male": "Hommes",
            "female": "Femmes",
            "other": "Autre",
            "unknown": "Inconnu"
        };
    }
    var selectKeysCategory = {};
    var keysCategory = [];
    var colors = [];

    keysCategory = ["male", "female", "other", "unknown"];
    selectKeysCategory = {
        "male": "Male",
        "female": "Female",
        "other": "Other",
        "unknown": "Unknown"
    }
    colors = ["#810f7c", "#b3cde3", "#8c96c6", "#8856a7"];

    var keysBars = ["male", "female", "other", "unknown"];

    var svg = d3.select("#figure3div").select("#figure3");

    if (language == "en")
        var marginLeft = 130;
    else
        var marginLeft = 150;

    const margin = {
        top: 30,
        right: 20,
        bottom: 80,
        left: marginLeft
    };

    var isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    var width = 1140 - margin.left - margin.right;
    var height = 540 - margin.top - margin.bottom;

    svg = svg
        .attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        })
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1140 580")
        .append("g")
        .attr("id", "graphG")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scaleBand()
        .range([0, height])
        .padding(0.3);

    var x = d3.scaleLinear()
        .range([0, width - margin.right]);

    var z = d3.scaleOrdinal()
        .range(colors);

    svg.append("g")
        .attr("class", "y-axis-3");

    svg.append("g")
        .attr("class", "x-axis-3");

    var xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
        .attr("class", "x-axis-title-3")
        .style("text-anchor", "middle")
        .style("font-size", "18px");

    var yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .attr("class", "y-axis-title-3")
        .style("text-anchor", "middle")


    var selectedBreakdown = null;
    var xMax = [];
    dataCurrentDate.map(function(d) {
        if (!isNaN(d["total"]) && d["age-group"] != "Total") {
            xMax.push(+d["total"]);
        }
    })
    var max = d3.max(xMax);
    var maxPow = Math.floor(Math.log10(max));
    var max2;
    if (max != 0)
        max2 = Math.ceil(max / Math.pow(10, maxPow)) * Math.pow(10, maxPow);
    else
        max2 = 0;

    x.domain([0, max2]);

    dataCurrentDate = dataCurrentDate.filter(function(d) {
        return d["age-group"] !== "Total";
    });

    y.domain(dataCurrentDate.map(function(d) {
        return d["age-group"];
    }));

    z.domain(keysBars);

    var xAxis = svg.select(".x-axis-3").attr("transform", "translate(0," + height + ")")
        .call(d3.axisBottom(x));

    xAxis
        .selectAll(".tick line")
        .attr("transform", "rotate(-180)")
        .attr('y2', height);

    xAxis
        .selectAll(".tick text")
        .style("font-size", "20px")
        .attr("y", 10);

    yAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en") {
                return "Age group (years)";
            }
            else {
                return "Groupe d'âge (années)";
            }
        });

    svg.select(".y-axis-3")
        .transition()
        .duration(500)
        .call(d3.axisLeft(y))
        .selectAll(".tick text")
        .style("font-size", "18px")
        .text(function(d) {
            if (language == "en") {
                return d;
            }
            else {
                if (d == "Unknown") {
                    return "Inconnu";
                }
                else {
                    return d.replace("to", "à");
                }
            }
        })

    xAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en") {
                return "Number of reports";
            }
            else {
                return "Nombre de rapports";
            }
        });

    var stack = d3.stack();

    svg.selectAll(".barAgeSex")
        .data(stack.keys(keysCategory)(dataCurrentDate))
        .enter()
        .append("g")
        .attr("class", function(d) {
            return "barAgeSex " + selectKeysCategory[d.key];
        })
        .style("opacity", 0)
        .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("y", function(d) {
            if (this.parentNode.__data__.key == "male")
                return y(d.data["age-group"]);
            else if (this.parentNode.__data__.key == "female")
                return y(d.data["age-group"]) + 6;
            else if (this.parentNode.__data__.key == "unknown")
                return y(d.data["age-group"]) + 13;
            else if (this.parentNode.__data__.key == "other")
                return y(d.data["age-group"]) + 20;
        })
        .attr("x", 0)
        .attr("width", function(d) {
            if (isNaN(x(d[1]) - x(d[0])))
                return 0
            return x(d[1]) - x(d[0]);
        })
        .attr("height", 7)
        .append("title")
        .text(function(d) {
            return legendJSONCategory[this.parentNode.parentNode.__data__.key] + " : " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
        });

    svg.selectAll(".barAge")
        .data(stack.keys(["total"])(dataCurrentDate))
        .enter()
        .append("g")
        .attr("class", "barAge")
        .attr("fill", function(d) { return z(d.key); })
        .selectAll("rect")
        .data(function(d) { return d; })
        .enter()
        .append("rect")
        .attr("y", function(d) { return y(d.data["age-group"]); })
        .attr("x", function(d) { return x(d[0]); })
        .attr("width", function(d) {
            if (isNaN(x(d[1]) - x(d[0])))
                return 0;
            return x(d[1]) - x(d[0]);

        })
        .attr("height", y.bandwidth())
        .append("title")
        .text(function(d) {
            return "Total : " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
        });

    var legendColours = d3.scaleOrdinal().range(colors);
    legendColours.domain(keysBars);

    var legendBars = svg.append("g")
        .attr("class", "legendGBars")
        .attr("font-family", "sans-serif")
        .style("font-size", "22px")
        .attr("text-anchor", "start")
        .attr("transform", "translate(-115,0)")
        .style("opacity", 0)
        .selectAll("g")
        .data(keysBars)
        .enter().append("g")
        .attr("transform", function(d, i) { return "translate(" + (width - margin.left + 100) + "," + i * 30 + ")"; })
        .attr("id", function(d) {
            return d;
        });

    legendBars.append("rect")
        .attr("x", 30)
        .attr("width", 24)
        .attr("height", 24)
        .attr("fill", function(d) { return legendColours(d); })
        .style("stroke-width", "0.5px")
        .style("stroke", "black")

    legendBars.append("text")
        .attr("x", 59)
        .attr("y", 9.5)
        .attr("dy", "0.4em")
        .text(function(d) { return legendJSONCategory[d]; });

    svg.append("text")
        .attr("id", "naText")
        .attr("x", 10)
        .attr("y", 32)
        .style("font-size", "1em")
        .style("opacity", "0")
        .text(function() {
            if (language == "en") return "N/A";
            else return "s.o.";
        })

    $("#figure3-dropdown-measure").on("change", function(e) {
        var measure1 = document.getElementById('figure3-dropdown-measure2');
        updateFigure3(data, this.value, measure1.options[measure1.selectedIndex].value);
    });
    $("#figure3-dropdown-measure2").on("change", function(e) {
        var measure1 = document.getElementById('figure3-dropdown-measure');
        updateFigure3(data, measure1.options[measure1.selectedIndex].value, this.value);
    });
    //work on isolating the bar graph
    function isolate(data, keysCategory, key, svg) {
        if (selectedBreakdown != null) {

            var stack = d3.stack();
            var stacked = stack.keys(Object.keys(keysCategory))(data);

            svg.selectAll(".barAgeSex")
                .data(stacked)
                .selectAll("rect")
                .data(function(d) {
                    return d;
                })
                .transition()
                .duration(500)
                .attr("x", function(d) { return x(d[0]); })
                .attr("width", function(d) { return x(d[1]) - x(d[0]); })
                .style("opacity", 1);

            selectedBreakdown = null;
        }
        else {
            selectedBreakdown = selectKeysCategory[key];
            svg.selectAll(".barAgeSex")
                .selectAll("rect")
                .transition()
                .duration(500)
                .attr("x", function(d) {
                    return x(0);
                });

            svg.selectAll(".barAgeSex:not(." + selectedBreakdown + ")")
                .selectAll("rect")
                .transition()
                .duration(500)
                .style("opacity", 0);
        }
    }

    function updateFigure3(data, measure, measure2) {
        //updateSelectOptions("f3")

        var keys = [];
        var colors = [];
        var svg = d3.select("#figure3");

        var stack = d3.stack();
        var filteredData;

        if (language == "en") {
            legendJSONCategory = {
                "male": "Male",
                "female": "Female",
                "unknown": "Unknown",
                "other": "Other",
                "rate-male": "Male reporting rate (per 100,000)",
                "rate-female": "Female reporting rate (per 100,000)",
                "rate-male-female": "Total reporting rate (per 100,000)"
            };
        }
        else {
            legendJSONCategory = {
                "male": "Hommes",
                "female": "Femmes",
                "unknown": "Inconnu",
                "other": "Autre",
                "rate-male": "Taux de signalement des hommes (par 100,000)",
                "rate-female": "Taux de signalement des femmes (par 100,000)",
                "rate-male-female": "Total taux de signalement (par 100,000)"
            };
        }
        var xMax = [];
        if (measure2 == "number") {
            d3.select("#naText").transition().duration(500).attr("y", 32).style("opacity", "0");
            d3.select("#naText2").transition().duration(500).attr("y", 70).style("opacity", "0");
            dataCurrentDate.map(function(d) {
                if (!isNaN(d["total"]) && d["age-group"] != "Total") {
                    xMax.push(+d["total"]);
                }
            });
        }
        else {
            d3.select("#naText").transition().duration(500).attr("y", 37).style("opacity", "0");
            d3.select("#naText2").transition().duration(500).attr("y", 77).style("opacity", "1");
            dataCurrentDate.map(function(d) {
                if (!isNaN(d["rate-age-group"]) && d["age-group"] != "Total") {
                    xMax.push(+d["rate-age-group"]);
                }
            });
        }
        var max = d3.max(xMax);
        var maxPow = Math.floor(Math.log10(max));
        var max2;
        if (max != 0)
            max2 = Math.ceil(max / Math.pow(10, maxPow)) * Math.pow(10, maxPow);
        else
            max2 = 0;

        if (measure2 == "rate")
            x.domain([0, 140]);
        else
            x.domain([0, max2]);

        svg.select(".x-axis-title-3")
            .transition()
            .duration(500)
            .text(function() {
                if (language == "en") {
                    if (measure2 == "number")
                        return "Number of reports";
                    else
                        return "Rate of reports per 100,000 doses administered";
                }
                else {
                    if (measure2 == "number")
                        return "Nombre de rapports";
                    else
                        return "Taux de rapports par 100 000 doses adminstrées";
                }
            })

        var xAxis = svg.select(".x-axis-3")
            .transition()
            .duration(500)
            .call(d3.axisBottom(x));

        xAxis.selectAll(".tick line")
            .transition()
            .duration(0)
            .attr("transform", "rotate(-180)")
            .attr('y2', height);

        xAxis
            .selectAll(".tick text")
            .style("font-size", "20px")
            .attr("y", 10);

        if (measure2 == "rate") {
            filteredData = dataCurrentDate.filter(function(d) {
                return d["age-group"] !== "Unknown";
            });
            y.domain(filteredData.map(function(d) {
                return d["age-group"];
            }));
        }
        else {
            y.domain(dataCurrentDate.map(function(d) {
                return d["age-group"];
            }));
        }

        svg.select(".y-axis-3")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y))
            .selectAll("text")
            .text(function(d) {
                if (language == "en")
                    return d;
                else
                    return d.replace("to", "à");
            });

        svg.select(".y-axis-3")
            .selectAll("text")
            .style("font-size", 18);

        if (measure == "both") {
            if (measure2 == "number") {
                keysCategory = ["male", "female", "other", "unknown"];

                svg.selectAll(".barAgeSex")
                    .data(stack.keys(keysCategory)(dataCurrentDate))
                    .selectAll("rect")
                    .data(function(d) { return d; })
                    .style("opacity", 1)
                    .attr("y", function(d) {
                        if (this.parentNode.__data__.key == "male")
                            return y(d.data["age-group"]);
                        else if (this.parentNode.__data__.key == "female")
                            return y(d.data["age-group"]) + 6;
                        else if (this.parentNode.__data__.key == "unknown")
                            return y(d.data["age-group"]) + 13;
                        else
                            return y(d.data["age-group"]) + 20;
                    })
                    .transition()
                    .duration(500)
                    .attr("y", function(d) {
                        if (this.parentNode.__data__.key == "male")
                            return y(d.data["age-group"]);
                        else if (this.parentNode.__data__.key == "female")
                            return y(d.data["age-group"]) + 6;
                        else if (this.parentNode.__data__.key == "unknown")
                            return y(d.data["age-group"]) + 13;
                        else
                            return y(d.data["age-group"]) + 20;
                    })
                    .attr("x", function(d) { return 0; })
                    .attr("width", function(d) {
                        if (isNaN(x(d[1]) - x(d[0])))
                            return 0
                        return x(d[1]) - x(d[0]);
                    })
                    .attr("height", function(d) {
                        return 7;
                    })
                    .select("title")
                    .text(function(d, i) {
                        return legendJSONCategory[this.parentNode.parentNode.__data__.key] + " : " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
                    });
            }
            else if (measure2 == "rate") {
                keysCategory = ["rate-male", "rate-female"];
                svg.selectAll(".barAgeSex")
                    .data(stack.keys(keysCategory)(dataCurrentDate))
                    .selectAll("rect")
                    .data(function(d) { return d; })
                    .style("opacity", function(d) {
                        if (d.data["age-group"] == "Unknown")
                            return 0;
                        else
                            return 1;
                    })
                    .attr("y", function(d) { return y(d.data["age-group"]) })
                    .transition()
                    .duration(500)
                    .attr("x", 0)
                    .attr("y", function(d) {
                        if (this.parentNode.__data__.key == "rate-male") {
                            if (y(d.data["age-group"]) == undefined)
                                return 0;
                            return y(d.data["age-group"]) + 1;
                        }
                        else if (this.parentNode.__data__.key == "rate-female") {
                            if (y(d.data["age-group"]) == undefined)
                                return 0;
                            return y(d.data["age-group"]) + 14;
                        }
                        else
                            return 0;
                    })
                    .attr("height", 13)
                    .attr("width", function(d) {
                        if (isNaN(x(d[1]) - x(d[0])))
                            return 0;
                        return x(d[1]) - x(d[0]);
                    })
                    .select("title")
                    .text(function(d) {
                        return legendJSONCategory[this.parentNode.parentNode.__data__.key] + " : " + d.data[this.parentNode.parentNode.__data__.key];
                    });
            }
        }
        else {
            if (measure2 == "number") {
                svg.select(".barAge")
                    .data(stack.keys(["total"])(dataCurrentDate))
                    .selectAll("rect")
                    .data(function(d) { return d; })
                    .style("opacity", 1)
                    .attr("y", function(d) { return y(d.data["age-group"]) })
                    .transition()
                    .duration(500)
                    .attr("x", function(d) { return x(d[0]); })
                    .attr("y", function(d) { return y(d.data["age-group"]) })
                    .attr("width", function(d) {
                        if (isNaN(x(d[1]) - x(d[0])))
                            return 0
                        return x(d[1]) - x(d[0]);

                    })
                    .select("title")
                    .text(function(d, i) {
                        return "Total : " + numberFormat(d.data[this.parentNode.parentNode.__data__.key]);
                    });
            }
            else if (measure2 == "rate") {
                svg.select(".barAge")
                    .data(stack.keys(["rate-age-group"])(dataCurrentDate))
                    .selectAll("rect")
                    .data(function(d) { return d; })
                    .style("opacity", function(d) {
                        if (d.data["age-group"] == "Unknown")
                            return 0;
                        else
                            return 1;
                    })
                    .attr("y", function(d) { return y(d.data["age-group"]) })
                    .transition()
                    .duration(500)
                    .attr("x", function(d) { return x(d[0]); })
                    .attr("y", function(d) {
                        if (measure2 == "number")
                            return y(d.data["age-group"]);
                        else
                            return y(d.data["age-group"]);
                    })
                    .attr("width", function(d) {
                        if (isNaN(x(d[1]) - x(d[0])))
                            return 0
                        return x(d[1]) - x(d[0]);

                    })
                    .select("title")
                    .text(function(d) {
                        return "Rate (Total) : " + d.data[this.parentNode.parentNode.__data__.key];
                    });
            }
        }

        svg = d3.select("#graphG");

        if (measure == "both") {
            d3.select(".legendGBars")
                .transition()
                .duration(800)
                .style("opacity", 1);

            svg.selectAll(".barAge")
                .transition()
                .duration(800)
                .style("opacity", 0);

            svg.selectAll(".barAgeSex")
                .transition()
                .duration(800)
                .style("opacity", 1);

            svg.selectAll(".barAgeSex").raise()
            if (measure2 == "number") {
                svg.select(".Unknown")
                    .selectAll("rect")
                    .transition()
                    .duration(500)
                    .style("opacity", 1);
                svg.select(".Other")
                    .selectAll("rect")
                    .transition()
                    .duration(500)
                    .style("opacity", 1);
                svg.select("#unknown")
                    .transition()
                    .duration(500)
                    .style("opacity", 1);
                svg.select("#other")
                    .transition()
                    .duration(500)
                    .style("opacity", 1);
            }
            else {
                svg.select(".Unknown")
                    .selectAll("rect")
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
                svg.select(".Other")
                    .selectAll("rect")
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
                svg.select("#unknown")
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
                svg.select("#other")
                    .transition()
                    .duration(500)
                    .style("opacity", 0);
            }
        }
        else {
            d3.select(".legendGBars")
                .transition()
                .duration(800)
                .style("opacity", 0);

            svg.selectAll(".barAge")
                .transition()
                .duration(800)
                .style("opacity", 1);

            svg.selectAll(".barAgeSex")
                .transition()
                .duration(800)
                .style("opacity", 0);
            svg.selectAll(".barAge").raise();
        }
    }
}

function figure4(data) {
    var collapsedToggle = true;
    var updatePreviousDataCount = 25;
    var currentDate = data.length - 1;
    var currentDate2 = data[currentDate]["data-cut-off-date"];
    var dataCurrentDate = data.filter(function(d) { return d["data-cut-off-date"] == currentDate2 });
    var fullData = dataCurrentDate;
    var table = d3.select("#figure4Table");
    var numRateToggle = true;

    table
        .append("tbody")
        .selectAll("tr")
        .data(dataCurrentDate)
        .enter()
        .append("tr")
        .html(function(d) {
            if (d["aefi"] == "Anaphylaxis")
                if (language == "en")
                    return "<td>" + "Anaphylaxis<sup>2</sup>" + "</td><td>" + numberFormat(d["pfizer-events"]) + "</td><td>" + numberFormat(d["moderna-events"]) + "</td><td>" + numberFormat(d["cov-azc-events"]) + "</td><td>" + numberFormat(d["janssen-events"]) + "</td><td>" + numberFormat(d["Novavax-events"]) + "</td><td>" + numberFormat(d["unspecified-events"]) + "</td><td>" + numberFormat(d["total-events"]) + "</td><td>" + decimalFormat(d["pfizer-rate"]) + "</td><td>" + decimalFormat(d["moderna-rate"]) + "</td><td>" + decimalFormat(d["cov-azc-rate"]) + "</td><td>" + decimalFormat(d["janssen-rate"]).replace("NaN", "N/A") + "</td><td>" + decimalFormat(d["total-rate"]) + "</td>";
                else
                    return "<td>" + "Anaphylaxie<sup>2</sup>" + "</td><td>" + numberFormat(d["pfizer-events"]) + "</td><td>" + numberFormat(d["moderna-events"]) + "</td><td>" + numberFormat(d["cov-azc-events"]) + "</td><td>" + numberFormat(d["janssen-events"]) + "</td><td>" + numberFormat(d["Novavax-events"]) + "</td><td>" + numberFormat(d["unspecified-events"]) + "</td><td>" + numberFormat(d["total-events"]) + "</td><td>" + decimalFormat(d["pfizer-rate"]) + "</td><td>" + decimalFormat(d["moderna-rate"]) + "</td><td>" + decimalFormat(d["cov-azc-rate"]) + "</td><td>" + decimalFormat(d["janssen-rate"]).replace("NaN", "s.o") + "</td><td>" + decimalFormat(d["total-rate"]) + "</td>";
            else if (d["aefi"] == "Myocarditis/Pericarditis")
                if (language == "en")
                    return "<td>" + "Myocarditis<sup>2</sup>/pericarditis" + "</td><td>" + numberFormat(d["pfizer-events"]) + "</td><td>" + numberFormat(d["moderna-events"]) + "</td><td>" + numberFormat(d["cov-azc-events"]) + "</td><td>" + numberFormat(d["janssen-events"]) + "</td><td>" + numberFormat(d["Novavax-events"]) + "</td><td>" + numberFormat(d["unspecified-events"]) + "</td><td>" + numberFormat(d["total-events"]) + "</td><td>" + decimalFormat(d["pfizer-rate"]) + "</td><td>" + decimalFormat(d["moderna-rate"]) + "</td><td>" + decimalFormat(d["cov-azc-rate"]) + "</td><td>" + decimalFormat(d["janssen-rate"]).replace("NaN", "N/A") + "</td><td>" + decimalFormat(d["total-rate"]) + "</td>";
                else
                    return "<td>" + "Myocardite<sup>2</sup>/péricardite" + "</td><td>" + numberFormat(d["pfizer-events"]) + "</td><td>" + numberFormat(d["moderna-events"]) + "</td><td>" + numberFormat(d["cov-azc-events"]) + "</td><td>" + numberFormat(d["janssen-events"]) + "</td><td>" + numberFormat(d["Novavax-events"]) + "</td><td>" + numberFormat(d["unspecified-events"]) + "</td><td>" + numberFormat(d["total-events"]) + "</td><td>" + decimalFormat(d["pfizer-rate"]) + "</td><td>" + decimalFormat(d["moderna-rate"]) + "</td><td>" + decimalFormat(d["cov-azc-rate"]) + "</td><td>" + decimalFormat(d["janssen-rate"]).replace("NaN", "s.o") + "</td><td>" + decimalFormat(d["total-rate"]) + "</td>";
            else if (d["aefi"] == "Bell's Palsy/facial paralysis")
                if (language == "en")
                    return "<td>" + "Bell's Palsy<sup>2</sup>/facial paralysis" + "</td><td>" + numberFormat(d["pfizer-events"]) + "</td><td>" + numberFormat(d["moderna-events"]) + "</td><td>" + numberFormat(d["cov-azc-events"]) + "</td><td>" + numberFormat(d["janssen-events"]) + "</td><td>" + numberFormat(d["Novavax-events"]) + "</td><td>" + numberFormat(d["unspecified-events"]) + "</td><td>" + numberFormat(d["total-events"]) + "</td><td>" + decimalFormat(d["pfizer-rate"]) + "</td><td>" + decimalFormat(d["moderna-rate"]) + "</td><td>" + decimalFormat(d["cov-azc-rate"]) + "</td><td>" + decimalFormat(d["janssen-rate"]).replace("NaN", "N/A") + "</td><td>" + decimalFormat(d["total-rate"]) + "</td>";
                else
                    return "<td>" + "Paralysie de Bell<sup>2</sup>/facial paralysis" + "</td><td>" + numberFormat(d["pfizer-events"]) + "</td><td>" + numberFormat(d["moderna-events"]) + "</td><td>" + numberFormat(d["cov-azc-events"]) + "</td><td>" + numberFormat(d["janssen-events"]) + "</td><td>" + numberFormat(d["Novavax-events"]) + "</td><td>" + numberFormat(d["unspecified-events"]) + "</td><td>" + numberFormat(d["total-events"]) + "</td><td>" + decimalFormat(d["pfizer-rate"]) + "</td><td>" + decimalFormat(d["moderna-rate"]) + "</td><td>" + decimalFormat(d["cov-azc-rate"]) + "</td><td>" + decimalFormat(d["janssen-rate"]).replace("NaN", "s.o") + "</td><td>" + decimalFormat(d["total-rate"]) + "</td>";
            else
                return "<td>" + short2txt(d["aefi"]) + "</td><td>" + numberFormat(d["pfizer-events"]) + "</td><td>" + numberFormat(d["moderna-events"]) + "</td><td>" + numberFormat(d["cov-azc-events"]) + "</td><td>" + numberFormat(d["janssen-events"]) + "</td><td>" + numberFormat(d["Novavax-events"]) + "</td><td>" + numberFormat(d["unspecified-events"]) + "</td><td>" + numberFormat(d["total-events"]) + "</td><td>" + decimalFormat(d["pfizer-rate"]) + "</td><td>" + decimalFormat(d["moderna-rate"]) + "</td><td>" + decimalFormat(d["cov-azc-rate"]) + "</td><td>" + (language == "en" ? decimalFormat(d["janssen-rate"]).replace("NaN", "N/A") : decimalFormat(d["janssen-rate"]).replace("NaN", "s.o")) + "</td><td>" + decimalFormat(d["total-rate"]) + "</td>";
        });
    $(".figure4NValue").text(numberFormat(d3.sum(dataCurrentDate, function(d) {
        if (language == "en")
            return d["total-events"];
        else
            return d["total-events"].replace(",", " ");
    })));

    var anaphylaxis = dataCurrentDate.filter(function(d) {
        return d["aefi"] == "Swollen tongue";
    });
    var blankSpacing = { "total-events": 0, "pfizer-events": 0, "moderna-events": 0, "cov-azc-events": 0, "janssen-events": 0, "Novavax-events": 0, "unspecified-events": 0, "pfizer-rate": 0, "moderna-rate": 0, "cov-azc-rate": 0, "total-rate": 0, "moderna-bivalent-BA45-reports": 0, "moderna-bivalent-BA1-events-rate":0 };
    dataCurrentDate = dataCurrentDate.slice(0, 23).concat(blankSpacing).concat(anaphylaxis);

    var svg = d3.select("#figure4");

    const margin = {
        top: 0,
        right: 20,
        bottom: 40,
        left: 330
    };

    var isIE = /*@cc_on!@*/ false || !!document.documentMode;
    if (/Edge\/\d./i.test(navigator.userAgent))
        isIE = true;

    var width = 1060 - margin.left - margin.right;
    var height = 620 - margin.top - margin.bottom;

    svg = svg
        .attr("width", function(d) {
            if (isIE) {
                return (width + margin.left + margin.right);
            }
            else {
                return;
            }
        })
        .attr("height", function(d) {
            if (isIE) {
                return (height + margin.top + margin.bottom);
            }
            else {
                return;
            }
        })
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", "0 0 1060 630")
        .append("g")
        .attr("class", "barG")
        .attr("transform",
            "translate(" + margin.left + "," + margin.top + ")");

    var y = d3.scaleBand()
        .range([0, height])
        .padding(0.50);

    var x = d3.scaleLinear()
        .range([0, width - margin.right]);

    var xAxisTitle = svg.append("text")
        .attr("transform", "translate(" + (width / 2) + " ," + (height + margin.top + 40) + ")")
        .style("text-anchor", "middle")
        .attr("class", "x-axis-title-3")
        .style("font-size", 18);

    var yAxisTitle = svg.append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", -5 - margin.left)
        .attr("x", 0 - (height / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .attr("class", "y-axis-title-3")
        .style("font-size", 18);

    svg.append("g")
        .attr("class", "y-axis-2");

    svg.append("g")
        .attr("class", "x-axis-2");

    y.domain(dataCurrentDate.map(function(d) {
        if (d["aefi"] !== "")
            return short2txt(d["aefi"]);
    }));

    var yMax = [];
    dataCurrentDate.map(function(d) {
        if (!isNaN(d["total-events"])) {
            yMax.push(+d["total-events"]);
        }
    })

    x.domain([0, d3.max(yMax) * 1.1]);

    svg.select(".x-axis-2")
        .attr("transform", "translate(0," + height + ")")
        .transition()
        .duration(500)
        .call(d3.axisBottom(x))
        .selectAll(".tick")
        .style("font-size", 14)
        .select("line")
        .style("font-size", 12)
        .attr('y2', -height)

    svg.select(".x-axis-2")
        .selectAll("text")
        .style("font-size", 15)
        .style("text-anchor", "middle")
        .attr("x", 0)
        .attr("y", 10);

    xAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en") {
                return "Number of adverse events";
            }
            else {
                return "Nombre d'effets secondaires";
            }
        });

    svg.select(".y-axis-2")
        .call(d3.axisLeft(y))
        .selectAll("text")
        .attr("x", -10)
        .style("font-size", 15);

    svg.select(".y-axis-2")
        .selectAll("text")
        .style("font-size", 15)
    //Adding seperator lines
    svg.select(".y-axis-2")
        .append("g")
        .style("cursor", "pointer")
        .append("line")
        .attr("class", "seperators")
        .attr("x1", -13)
        .attr("x2", 13)
        .attr("y1", 545)
        .attr("y2", 540)
        .attr("stroke", "black")
        .attr("stroke-width", "1.5px")
        .on("click", function() {
            d3.select("#figure4Toggle").dispatch('click');
        });

    var _seperator = svg.select(".y-axis-2")
        .append("g")
        .style("cursor", "pointer")
        .on("click", function() {
            d3.select("#figure4Toggle").dispatch('click');
        });

    _seperator.append("circle")
        .attr("cx", 0)
        .attr("cy", 550)
        .attr("r", 15)
        .attr("width", 26)
        .attr("height", 15)
        .attr("fill", "#cccccc")
        .style("opacity", 0)

    _seperator.append("line")
        .attr("class", "seperators")
        .attr("x1", -13)
        .attr("x2", 13)
        .attr("y1", 540)
        .attr("y2", 535)
        .attr("stroke", "black")
        .attr("stroke-width", "1.5px")

    yAxisTitle
        .transition()
        .duration(500)
        .text(function() {
            if (language == "en") {
                return "Most frequently reported adverse events";
            }
            else {
                return "Effets secondaires les plus souvent signalés";
            }
        });

    svg.selectAll("rect")
        .data(dataCurrentDate.map(function(d) {
            if (d["aefi"] !== "")
                return d;
        }))
        .enter()
        .append("rect")
        .attr("fill", function(d) { return "#8c96c6"; })
        .attr("class", "figure4Bar")
        .attr("id", function(d) {
            if (d[""] == 0)
                return "blankBar";
            else
                return "newFigure";
        })
        .attr("y", function(d) { return y(short2txt(d["aefi"])); })
        .attr("x", x(0))
        .attr("width", function(d) { return x(d["total-events"]) - x(0); })
        .attr("height", y.bandwidth())
        .append("title")
        .text(function(d) {
            return d["aefi"] + ": " + d["total-events"];
        });

    $("#figure4-dropdown-measure").on("change", function() {
        updateFigure4((!collapsedToggle ? fullData : dataCurrentDate), this.value);
    });

    $("#figure4-dropdown-measure2").on("change", function() {
        if (($("#figure4-dropdown-measure").val() == "unspecified" 
        || $("#figure4-dropdown-measure").val() == "novavax"
        || $("#figure4-dropdown-measure").val() == "pfizer-bivalent"
        || $("#figure4-dropdown-measure").val() == "moderna-bivalent-BA1") && numRateToggle)
            $("#figure4-dropdown-measure").val("covishield/astrazeneca");

        if (numRateToggle) {
            numRateToggle = false;
            d3.selectAll(".noRateFig4").style("display", "none");
            
        }
        else {
            d3.selectAll(".noRateFig4").style("display", "inline");
            numRateToggle = true;
        }
        if (!collapsedToggle)
            updateFigure4(fullData, $("#figure4-dropdown-measure").val());
        else
            updateFigure4(dataCurrentDate, $("#figure4-dropdown-measure").val());
    });
    $("#figure4Toggle").on("click", function(e) {
        if (collapsedToggle) {
            collapsedToggle = false;
            updateFigure4(fullData, $("#figure4-dropdown-measure").val());
            if (language == "en")
                $("#figure4Toggle").text("Show Less Adverse Events");
            else
                $("#figure4Toggle").text("Afficher moins d'effets secondaires");

            svg.select(".y-axis-2").selectAll(".seperators").remove();

        }
        else {
            collapsedToggle = true;
            updateFigure4(dataCurrentDate, $("#figure4-dropdown-measure").val());
            if (language == "en")
                $("#figure4Toggle").text("Show More Adverse Events");
            else
                $("#figure4Toggle").text("Afficher plus d'effets secondaires");

            _seperator.append("line")
                .attr("class", "seperators")
                .attr("x1", -13)
                .attr("x2", 13)
                .attr("y1", 545)
                .attr("y2", 540)
                .attr("stroke", "black")
                .attr("stroke-width", "1.5px");

            svg.select(".y-axis-2")
                .append("g")
                .style("cursor", "pointer")
                .append("line")
                .attr("class", "seperators")
                .attr("x1", -13)
                .attr("x2", 13)
                .attr("y1", 540)
                .attr("y2", 535)
                .attr("stroke", "black")
                .attr("stroke-width", "1.5px")
                .on("click", function() {
                    d3.select("#figure4Toggle").dispatch('click');
                })
        }
    });

    function updateFigure4(data, measure) {
        //updateSelectOptions("f4")
        var color = "#8c96c6"; //(measure == "Total Non-serious AEFI" ? "#8c96c6" : "#88419d");
        var tempDataCurrentDate;
        switch (measure) {
            case "total":
                if (numRateToggle)
                    measure = "total-events";
                else
                    measure = "total-rate";
                break;
            case "pfizer":
                if (numRateToggle)
                    measure = "pfizer-events";
                else
                    measure = "pfizer-rate";
                break;
            case "pfizer-bivalent":
                if (numRateToggle)
                    measure = "pfizer-bivalent-reports";
                else
                    measure = "pfizer-bivalent-reports-rate";
                break;
            case "moderna":
                if (numRateToggle)
                    measure = "moderna-events";
                else
                    measure = "moderna-rate";
                break;
            case "moderna-bivalent-BA1":
                if (numRateToggle)
                    measure = "moderna-bivalent-BA1-reports";
                else
                    measure = "moderna-bivalent-BA1-rate";
                break;
            case "moderna-bivalent-BA45":
                if (numRateToggle)
                    measure = "moderna-bivalent-BA45-reports";
                else
                    measure = "moderna-bivalent-BA45-rate";
                break;
            case "covishield/astrazeneca":
                if (numRateToggle)
                    measure = "cov-azc-events";
                else
                    measure = "cov-azc-rate";
                break;
            case "janssen":
                if (numRateToggle)
                    measure = "janssen-events";
                else
                    measure = "janssen-rate";
                break;
            case "novavax":
                if (numRateToggle)
                    measure = "Novavax-events";
                else
                    measure = "Novavax-events";
                break;
            case "unspecified":
                if (numRateToggle)
                    measure = "unspecified-events";
                else
                    measure = "unspecified-events";
                break;
        }
        colors = ["#88419d"];
        var svg = d3.select("#figure4");

        tempDataCurrentDate = data.filter(function(d) {
            return d["aefi"] !== "";
        });

        y.domain(tempDataCurrentDate.map(function(d) {
            return short2txt(d["aefi"]);
        }));

        var yMax = [];
        tempDataCurrentDate.map(function(d) {
            if (!isNaN(d[measure])) {
                yMax.push(+d[measure]);
            }
        })
        if (measure == "Novavax-events")
            x.domain([0, 10]);
        else
            x.domain([0, d3.max(yMax) * 1.1]);

        svg.select(".x-axis-2")
            .attr("transform", "translate(0," + height + ")")
            .transition()
            .duration(500)
            .call(d3.axisBottom(x))
            .selectAll(".tick")
            .style("font-size", 14)
            .select("line")
            .style("font-size", 12)
            .attr('y2', -height);

        svg.select(".x-axis-2")
            .selectAll("text")
            .style("font-size", 15)
            .style("text-anchor", "middle")
            .attr("x", 0)
            .attr("y", 10);

        xAxisTitle
            .transition()
            .duration(500)
            .text(function() {
                if (numRateToggle)
                    if (language == "en")
                        return "Number of adverse events";
                    else
                        return "Nombre d'effets secondaires";
                else
                if (language == "en")
                    return "Rate of adverse events per 100,000 doses administered";
                else
                    return "Taux d’événements par 100 000 doses administrées";

            });

        svg.select(".y-axis-2")
            .transition()
            .duration(500)
            .call(d3.axisLeft(y))
            .selectAll("text")
            .attr("x", -10)
            .style("font-size", function() {
                if (data.length > 25)
                    return 12.2;
                else
                    return 15;
            });

        svg.select(".y-axis-2")
            .selectAll("text")
            .style("font-size", function() {
                if (data.length > 25)
                    return 12.2;
                else
                    return 15;
            });

        yAxisTitle
            .transition()
            .duration(500)
            .text(function() {
                if (language == "en")
                    return "Most frequently reported adverse events";
                else
                    return "Effets secondaires les plus souvent signalés";
            });
        d3.select("#blankBar")
            .attr("width", function() { return x(tempDataCurrentDate[10][measure]) - x(0); });

        d3.select(".barG")
            .selectAll("rect")
            .data(tempDataCurrentDate)
            .exit()
            .remove();


        var currBars = d3.select(".barG").selectAll(".figure4Bar")
            .data(tempDataCurrentDate);

        if (updatePreviousDataCount !== data.length) {
            currBars
                .enter()
                .append("rect")
                .attr("y", function(d) { return y(short2txt(d["aefi"])); })
                .merge(currBars)
                .attr("opacity", function(d) {
                    if (y(short2txt(d["aefi"])) == undefined)
                        return 0;
                    else
                        return 1;
                })
                .transition()
                .duration(500)
                .attr("y", function(d) { return y(short2txt(d["aefi"])); })
                .attr("x", x(0))
                .attr("width", function(d) {
                    if (d[measure] == undefined || d[measure] == "N/A")
                        return x(0);
                    return x(d[measure]) - x(0);
                })
                .attr("height", y.bandwidth())
                .attr("fill", color)
                .attr("id", "newFigure")
                .selectAll("title")
                .text(function(d, i) {
                    return d["aefi"] + ": " + d[measure];
                });
        }
        else {
            d3.selectAll("#newFigure")
                .transition()
                .duration(500)
                .attr("width", function(d) {
                    if (d[measure] == undefined || d[measure] == "N/A")
                        return x(0);
                    return x(d[measure]) - x(0);
                })
                .selectAll("title")
                .text(function(d, i) {
                    return d["aefi"] + ": " + d[measure];
                });

        }
        updatePreviousDataCount = data.length;
    }
}

function AESITable(data) {
    var dropdownSelection = d3.select("#AESITable-dropdown-measure").property("value");
    var dropdownSelection2 = d3.select("#AESITable2-dropdown-measure").property("value");
    var currentDate = data.length - 1;
    var currentDate2 = data[currentDate]["data-cut-off-date"];
    var dataCurrentDate = data.filter(function(d) { return d["data-cut-off-date"] == currentDate2 });
    $(".totalAESI").text(numberFormat(dataCurrentDate[dataCurrentDate.length - 1]["total-events"]));

    var table = d3.select("#AESITable");
    var trHeader = d3.select("#tableHeader");
    var headerlist = ["Total"];
    var lastAESI = "";
    var rateTitle;
    d3.select("#ratesOption").style("display", "inline");
    switch (dropdownSelection) {
        case "pfizer-events":
            if (dropdownSelection2 == "rate") {
                headerlist = "Reporting rate of Pfizer events per 100,000 doses administered";
                d3.selectAll(".noRate").style("display", "none");
            }
            else {
                headerlist = "Number of Pfizer events";
                d3.selectAll(".noRate").style("display", "inline");
            }
            rateTitle = "pfizer-rate";
            break;
        case "pfizer-bivalent-events":
            if (dropdownSelection2 == "rate") {
                headerlist = "Reporting rate of Pfizer-BioNTech Comirnaty Bivalent (Original and Omicron BA.4/BA.5) events per 100,000 doses administered";
                d3.selectAll(".noRate").style("display", "none");
            }
            else {
                headerlist = "Number of Pfizer-BioNTech Comirnaty Bivalent (Original and Omicron BA.4/BA.5) events";
                d3.selectAll(".noRate").style("display", "inline");
            }
            d3.select("#ratesOption").style("display", "none");
            break;
        case "moderna-events":
            if (dropdownSelection2 == "rate") {
                headerlist = "Reporting rate of Moderna events per 100,000 doses administered";
                d3.selectAll(".noRate").style("display", "none");
            }
            else {
                headerlist = "Number of Moderna events";
                d3.selectAll(".noRate").style("display", "inline");
            }
            rateTitle = "moderna-rate";
            break;
        case "moderna-bivalent-BA1-events":
            if (dropdownSelection2 == "rate") {
                headerlist = "Reporting rate of Moderna Spikevax (Original/Omicron BA.1) bivalent events per 100,000 doses administered";
                d3.selectAll(".noRate").style("display", "none");
            }
            else {
                headerlist = "Number of Moderna Spikevax (Original/Omicron BA.1) bivalent events";
                d3.selectAll(".noRate").style("display", "inline");
            }
            d3.select("#ratesOption").style("display", "none");
            break;
        case "moderna-bivalent-BA.4/5-events":
            if (dropdownSelection2 == "rate") {
                headerlist = "Reporting rate of Moderna Spikevax (Original/Omicron BA.4/5) bivalent events per 100,000 doses administered";
                d3.selectAll(".noRate").style("display", "none");
            }
            else {
                headerlist = "Number of Moderna Spikevax (Original/Omicron BA.4/5) bivalent events";
                d3.selectAll(".noRate").style("display", "inline");
            }
            d3.select("#ratesOption").style("display", "none");
            break;
        case "cov-azc-events":
            if (dropdownSelection2 == "rate") {
                headerlist = "Reporting rate of AstraZeneca/COVISHIELD events per 100,000 doses administered";
                d3.selectAll(".noRate").style("display", "none");
            }
            else {
                headerlist = "Number of AstraZeneca/COVISHIELD events";
                d3.selectAll(".noRate").style("display", "inline");
            }
            rateTitle = "cov-azc-rate";
            break;
        case "janssen-events":
            if (dropdownSelection2 == "rate") {
                headerlist = "Reporting rate of Janssen events per 100,000 doses administered";
                d3.select("#unspecifiedOption").style("display", "none");
                d3.select("#janssenOption").style("display", "none");
                d3.select("#novavaxOption").style("display", "inline");
            }
            else {
                headerlist = "Number of Janssen JCOVDEN events";
               d3.selectAll(".noRate").style("display", "inline");
            }
            d3.select("#ratesOption").style("display", "none");
            break;
        case "Novavax-events":
            if (dropdownSelection2 == "rate") {
                headerlist = "Reporting rate of Novavax events per 100,000 doses administered";
                d3.selectAll(".noRate").style("display", "none");
            }
            else {
                headerlist = "Number of Novavax Nuvaxovid events";
                d3.selectAll(".noRate").style("display", "inline");
            }
            d3.select("#ratesOption").style("display", "none");
            break;
        case "unspecified-events":
            if (dropdownSelection2 == "rate") {
                headerlist = "Reporting rate of Unspecified events per 100,000 doses administered";
                d3.selectAll(".noRate").style("display", "none");
            }
            else {
                headerlist = "Number of Unspecified events";
                d3.selectAll(".noRate").style("display", "inline");
            }
            d3.select("#ratesOption").style("display", "none");
            break;
        case "total-events":
            if (dropdownSelection2 == "rate") {
                headerlist = "Total reporting rate per 100,000 doses administered";
                d3.selectAll(".noRate").style("display", "none");
            }
            else {
                headerlist = "Total number of events";
               d3.selectAll(".noRate").style("display", "inline");
            }
            rateTitle = "total-rate";
            break;
    }

    trHeader
        .selectAll(".header3Col")
        .html(short2txt(headerlist));

    table.selectAll("tbody")
        .remove();

    table
        .append("tbody")
        .selectAll("tr")
        .data(dataCurrentDate)
        .enter()
        .append("tr")
        .html(function(d) {
            var rowspan = dataCurrentDate.filter(function(e) {
                return e["aesi-category"] == d["aesi-category"];
            }).length;

            if (d["aesi"] == "Subtotal") {
                if (dropdownSelection2 == "count") {
                    lastAESI = d["aesi-category"];
                    return "<td style='font-weight:bold;'>" + short2txt(d["aesi"]) + "</td><td style='font-weight:bold;'>" + numberFormat(d[dropdownSelection]) + "</td>";
                }
                else {
                    lastAESI = d["aesi-category"];
                    return "<td style='font-weight:bold;'>" + short2txt(d["aesi"]) + "</td><td style='font-weight:bold;'>" + d[rateTitle] + "</td>";
                }
            }
            else if (lastAESI == d["aesi-category"]) {
                if (d[dropdownSelection] == "N/A" && dropdownSelection2 == "count")
                    return "<td>" + short2txt(d["aesi"]) + "</td><td>" + short2txt(d[dropdownSelection]) + "</td>";
                else if (d[rateTitle] == "N/A" && dropdownSelection2 !== "count")
                    return "<td>" + short2txt(d["aesi"]) + "</td><td>" + short2txt(d[rateTitle]) + "</td>";
                else if (dropdownSelection2 == "count")
                    return "<td>" + short2txt(d["aesi"]) + "</td><td>" + numberFormat(d[dropdownSelection]) + "</td>";
                else
                    return "<td>" + short2txt(d["aesi"]) + "</td><td>" + d[rateTitle] + "</td>";
            }
            else {
                if (short2txt(d["aesi-category"]) == "All AESI categories" || short2txt(d["aesi-category"]) == "Toutes les catégories AESI") {
                    if (d[dropdownSelection] == "N/A" && dropdownSelection2 == "count")
                        return "<td rowspan=" + rowspan + " style='font-weight:bold;'>" + short2txt(d["aesi-category"]) + "</td><td style='font-weight:bold;'>" + short2txt(d["aesi"]) + "</td><td style='font-weight:bold;'>" + short2txt(d[dropdownSelection]) + "</td>";
                    else if (d[rateTitle] == "N/A" && dropdownSelection2 !== "count")
                        return "<td rowspan=" + rowspan + " style='font-weight:bold;'>" + short2txt(d["aesi-category"]) + "</td><td style='font-weight:bold;'>" + short2txt(d["aesi"]) + "</td><td style='font-weight:bold;'>" + short2txt(d[rateTitle]) + "</td>";
                    else if (dropdownSelection2 == "count") {
                        lastAESI = d["aesi-category"];
                        return "<td rowspan=" + rowspan + " style='font-weight:bold;'>" + short2txt(d["aesi-category"]) + "</td><td style='font-weight:bold;'>" + short2txt(d["aesi"]) + "</td><td style='font-weight:bold;'>" + numberFormat(d[dropdownSelection]) + "</td>";
                    }
                    else {
                        lastAESI = d["aesi-category"];
                        return "<td rowspan=" + rowspan + " style='font-weight:bold;'>" + short2txt(d["aesi-category"]) + "</td><td style='font-weight:bold;'>" + short2txt(d["aesi"]) + "</td><td style='font-weight:bold;'>" + d[rateTitle] + "</td>";
                    }
                }
                else {
                    if (d[dropdownSelection] == "N/A" && dropdownSelection2 == "count") {
                        lastAESI = d["aesi-category"];
                        return "<td rowspan=" + rowspan + ">" + short2txt(d["aesi-category"]) + "</td><td>" + short2txt(d["aesi"]) + "</td><td>" + short2txt(d[dropdownSelection]) + "</td>";
                    }
                    else if (d[rateTitle] == "N/A" && dropdownSelection2 !== "count") {
                        lastAESI = d["aesi-category"];
                        return "<td rowspan=" + rowspan + ">" + short2txt(d["aesi-category"]) + "</td><td>" + short2txt(d["aesi"]) + "</td><td>" + short2txt(d[rateTitle]) + "</td>";
                    }
                    else if (dropdownSelection2 == "count") {
                        lastAESI = d["aesi-category"];
                        return "<td rowspan=" + rowspan + ">" + short2txt(d["aesi-category"]) + "</td><td>" + short2txt(d["aesi"]) + "</td><td>" + numberFormat(d[dropdownSelection]) + "</td>";
                    }
                    else {
                        lastAESI = d["aesi-category"];
                        return "<td rowspan=" + rowspan + ">" + short2txt(d["aesi-category"]) + "</td><td>" + short2txt(d["aesi"]) + "</td><td>" + d[rateTitle] + "</td>";
                    }
                }
            }
        });
}

function wrapVertical(text, width) {
    text.each(function() {
        var text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1.1,
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", y - 50).attr("y", -110).attr("dy", dy + "em");
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if (tspan.node().getComputedTextLength() > width && line.length != 1) {
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", y - 50).attr("y", -110).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}
function wrap(text, width) {
    text.each(function() {
        let tempText = d3.select(this).text();
        if(tempText.includes("Vaxzevria/COVISHIELD"))
            d3.select(this).text("AstraZeneca Vaxzevria/ COVISHIELD");
       
        let text = d3.select(this),
            words = text.text().split(/\s+/).reverse(),
            word,
            line = [],
            lineNumber = 0,
            lineHeight = 1,
            currLine = 1,
            y = text.attr("y"),
            dy = parseFloat(text.attr("dy")),
            tspan = text.text(null).append("tspan").attr("x", -1).attr("y", y).attr("dy", dy + "em");
        
        while (word = words.pop()) {
            line.push(word);
            tspan.text(line.join(" "));
            if ((tspan.node().getComputedTextLength() > width && line.length != 1) ) {
                currLine++;
                line.pop();
                tspan.text(line.join(" "));
                line = [word];
                tspan = text.append("tspan").attr("x", -1).attr("y", y).attr("dy", ++lineNumber * lineHeight + dy + "em").text(word);
            }
        }
    });
}