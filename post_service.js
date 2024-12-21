const express = require('express');
const cheerio = require('cheerio');


const app = express();
const port = 56567;

// Define the route to handle requests
app.get('/track/:track_code', async (req, res) => {
  const trackCode = req.params.track_code; // Extract track_code from the URL
  if(trackCode.length < 24){
    return res.send({success: false, message: "Barcode must be 24 charachters"})
  }
  const page_source = await searchCode(trackCode);
  res.send(await scrapeResult(page_source));
});

// Start the server
app.listen(port, () => {
  console.log(`Server is running at http://localhost:${port}`);
});



async function searchCode(track_code) {
    const response = await fetch("https://tracking.post.ir/", {
      "headers": {
        "accept": "text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,image/apng,*/*;q=0.8,application/signed-exchange;v=b3;q=0.7",
        "accept-language": "en-US,en;q=0.9",
        "cache-control": "max-age=0",
        "content-type": "application/x-www-form-urlencoded",
        "sec-ch-ua": "\"Google Chrome\";v=\"131\", \"Chromium\";v=\"131\", \"Not_A Brand\";v=\"24\"",
        "sec-ch-ua-mobile": "?0",
        "sec-ch-ua-platform": "\"Windows\"",
        "sec-fetch-dest": "document",
        "sec-fetch-mode": "navigate",
        "sec-fetch-site": "same-origin",
        "sec-fetch-user": "?1",
        "upgrade-insecure-requests": "1"
      },
      "referrer": "https://tracking.post.ir/",
      "referrerPolicy": "strict-origin-when-cross-origin",
      "body": "__EVENTTARGET=btnSearch&__EVENTARGUMENT=&__VIEWSTATE=ziW565E1UZNwyBNBzWyh6yTfMOplCFEAdz36uD3bU5O%2FrKrxDBgfdC42hxignrFOsCcRazJ%2FxrprSg8HUXcMywN6YIFWN6UMOVufuS8ju6BGYejsbO234bHWxxvreEvcOlOzjpZLHcwfmJ38GWrVnuPQNRzT5JgoTrmlKMjiYck2iUWAGYusuo0Z97hNkkQI38r0f698%2B7fCGNu0nYuhdJLkx3s4ohsMa5VHmYlIYoniFuH8LqsAMp1B77n%2BxKCg8yeC5ryVJVw1xfWqEnCpzsziRHuiqXi2BjF08WLoSxd0PXCAdYowKm4UMLuMa5YbdTexMbZb%2BoH96zj6DgBJDLFeGDpcmZ8EX3xGeMyeD5n9hK5JLqQk8jm4dKT%2F6OtJHB%2BdXR1YvnP6T6hmmGYrW9jjnSugdlRK0k2qTZ2yn4wQ%2BPEWQuAK%2BPjS%2F%2F1F1IL8kVju%2BryeAlGJQWFkPrWvdu28y9G7iHF1aXxk6%2FvkLjLaUTyquAh2L6qI2OhxXsqHAlb9qDUi1jkHfP2Tj2WLBFirOKIm4kJUTXtV26CTYhfE%2F3p06bNdYKjkiqfz%2FPeZDBBJwl3YaILlb22ymMeuEjynO0q4EIboFFgK6Za7uHvibqPKnYDhqNzUNiMNQSjHVo39AZcF%2FH%2B5Id4sFXuwFyzQIPAuzvr6TMG%2BQgDS76P4U7cYKClaMlqSfelxc7LgxUP%2FNkCLeNcczP8oLAHFL4ix%2BOcHbl%2B1MMAvYalX5YNZtBJojb8AYuuYPMk3e%2BFyVVnGOApybZVJNHtyzSUWSao%2FhkdnQ8NJCCNLjpb%2FQO80G%2FmHunOkx8MYttZdEFXCTYe3a%2BJOVLrcawayOD6fK5Ozfs4h1pT9jeQhLQ5TxF9renOyhjuhUF4Z6ICl4Gru9APPvpP4aeLk0c%2FHN12SNxxiOCLOonwFm1YgCkL76%2FuJ84VMGLWFeHZPmmj8UfZB5KX7MAcX2RFdP93fe49oz4UHkBZqVxxEQhXfULsm%2ByPXbjzeNjJWmKvpZpjewi2YzzFJRpF2l2TwqHNg2ZrWdRHN9p8ox1jJH0LQg03j4yZtoMJ8jmqwMHXwLDecxAYNt5RYUBQVETHXZo5%2FZsnLrFfCGt2qsr3mFEDJRnGtQMqElE4fCcuwBzubhNycxPr4uJtGZf4mULIY0kfHv%2BPu1ouXs%2FVAJqUeUPwC38qbZthm6v0GF3g6NMvAgn2R2efuvh0L4VRt04v4mmPvPW%2BTzDR8P%2BA5iNCBHymHl2jVjXtWYHA6%2B%2Fdoba1%2BUEYA4nqIjv5w2wwzIIeNogaR6NPJ4KNGBZxhO13qmbmk2XC1VISC1Hw1H%2FlKmllamW3BDpQ3qjZf8NJnp225Tr1INNIcQLSmgFCLGbUzs%2FAv%2BvN0h20aaR2Ra%2FyFzMapbSctPs40fcxFxB2UpD98Za9Nx3%2Bl%2FxychEniYqvZcOossBsCzrUhhRHLvNv6iyuFt21cpYgKW66Fz8UxSiIrNeQhPdswhYkrIpisKv9w0cRJTcFkN3eY559eKinoyfbl9BvlINH8IybVKCIPtvjXFpSc6LGGIm8CPMSCJCnsijiklZlanvrHKdBIhwdTjwNPyGDp4YQM36Fe4tWeo4fABmYdKIvS%2BLRlKcuHVWiIout1VEVk1drxXNN%2BSqZYjEesgrzPXMsVRi5IXc8QO36VUeuMD53bw9bXHOJsP6NTQARDIpGQafNGZGlm09vH73nJ6fflgxuYEW5%2B%2FZZ8evK5MoGkRJwdndvPUsJqUCAtf8MPLGzTlwnJ7%2BxfAtvn98R1kYQmS8YzH1fvdRsgFwhYlfd%2FlBJg%2FywazLO5KD9jfwBGatwrCyfIFG%2Fx4nNDLUlheUmPq%2FCYg34Kwehzo9mGtL%2BhoGdwILJNy8BeL0m0HNkM6LJ34Z%2BJENuoqMWiC4rFc0%2Fjoqykvsotfi7Cg2hmyn34ojR43WePi8wLuZMZ7Gos6jFr%2BWgAdfWkPLpGtlZPS14s3UKI7fk1bxt66QDS0MGNp%2F7drjFWg4p3XCg39tzB1OpWB%2FZn856MmsujaWWcatd6mMWWIV3mIgCkjdGsEwAea6xRqIAwH3ljrF3821l0WfNee30jmaBsydTwgtlPvslAMgSgOczFe5vcntcdE7%2B7EDmauu4gY4QCBroQ%2FSjykonKQLYFC8N67BbTaz46bZcpOOrxZReLJKWT0cY7m0%2BDOnugEsIWjtxJjnrbz8W%2FZWKXbsjzKqS5hYHyhe69cozFLv4wFWgxk%2BczwRO3w9hOE3Hj1pruQOfaJjt%2Bs%2BiLFXaGSoyxc2l2oPRL%2F2%2FkgY2vn0OBGLd0fnJ%2BRdEugc5X9e64EXp0oq%2BIsIl1J6uePh50xDK7KhGAMW5mJc%2FnKfYWIZ98FuTc4iDJb1ODwR3LNKZbfwC%2BTT1gVMoQzsAt68lycWF9Jhz5o5l5xzN0sFyixYloDwTEgu%2FC%2B8e%2BweIJhVJ7ngVLAE3SjKQeIuXC9Dl81Sc8B5JLI8jfXfGpTnfpjnZLR1s8IlLhCSTWqKyp7EvARUIs80l6UYQPUwgwKqKZTeAwD8toOQN0ohJ7KadBG2%2Bo%2F7zSH2nbpPYXilURyobwZYFGdunVxIlRR7V343xgmYBQ68kv1c4qWZ2tmBJGgKtGEXamLgXqWLn7I4BkEw%2FVB2xDbjmxijcCSZHqhMJyFTDm8YcY4rykAc4YNDPA0Xb9JdFF%2BMWZP7YU%2B4N%2FPTfdIWVShg0KtsG8FyzzTO8AOmHRqHQqioS3jTz0s9zIuggbUwp%2BX4SakyRyhA9mc6qOW0FaytqzKgbojVSdTDnGgFtf%2ByV5iw3rSAjoqVvIoQV9DXtb6lDgkydl9g%2FfhQra6GhwMjLrajgsLUdBA%2FDnRjXEY%2F1d22zLMwjl6xxUt2%2BvqW0BlfrBFP0vbpr0sevQgkyAL0iyauliG1LET2aaf08O1McmbMEVkgzM8KZUApkAknme%2B1bU85iUfzw4EsUwOndyxjHsOKn22%2BND23lmqdOhtyEGp5bzJR7zya3%2FlnBHKK2og8BQ2kwDuAjdms15e2577q%2FyZ3hn8UyAPuEU1pk6HSqz5NK6bu%2FFWw0DNZRDMom6jyNeLk8VKGJhbGCAehLn6RnzHDXIicoFG1hhdfeEUi%2BcqJhU8px5gWcUlHgh2%2BIQFbo7iZbh4ow%2FbIW6eqZ0JnTsFotvb2mnKK5PCroToYjUeXOP8bl5SL%2FKG2U4KE7EmpMkx02KQ3VHC2AdIcpEjXEhxQQGdg2wGExy1LpNlNeEMUkJFDr5BS6G73sI1MNEGmzzu1zTRAgbT0qH2QNBIMseiDF1bhQ3Boj9u5iFtkj1lOb6fvpDqev66sepBY1dnlvLzc3LIFdjUm3qpiy1xhLZM3KY2ngny7vQwfCFAZks5PjQdgT6yzMRNhGz5iBZwGxTEHPge1lY3Dfu%2F3nOjCEfY9Uq40ltEUk6MtmGK7DyOG%2FYdVlX6MVISrLxl4147M85wMqU4WaAyupHWejwiSj5QAGMSlaCx%2Fb3VrQ7%2FsQEusmoeVoCMqn6jno9GOU2%2FzYakFAOkCJIylOFIlJQkOJhNznsJGJOoNn9jUK9t88dkYnRLxGcOB2rOnjHu%2F%2BoysnIjMW%2BtViH%2Fl0i3CPXqHhXhDU3TyLa1xgnS6OyEm3eiCwWq5ALNcrYW%2B0gwzNJd8vdMF7e%2FThFNcWpU8sEcOluKBWHEwopw0VsrTt8RDK8pUZLvB3M9BvIy1V3PXK09NUaGnoNBS51zfm%2B9vttj9sXYR52IesvHYxTrFmkKhL0nK4rGl4BVz%2FX7EK6BBwP8Gpo2eF8mXYUpbRUcc39oGuEJMvXuZ9Ve7X%2B5mGuDP5qdnOU8VhHSrF2K120FM%2BmBJKHJZ5brO%2FfI5eGcwHOgvdp6BHcdqXOI5sI9%2BWqBFrQ6THrifytVwZoSNVNYUcgyiuWUiEu0VGZx4dVHmwkWXgGHU03EakwbUpmGGLvgpkSCq1z9iQcn9RiJBChOttMg6ka8o10NI6dd4Pr96juh4FXtjtOeWA4wDoDX8pLY42Jl7Q7%2F6hhXJWODXOfv5SjlXh7EAO6K7WloCCPTHvNr18tZ%2Buq1ZdO38eMtSuTg7nB7Vl9KZpt18F3esmCl1ObD9J6BeyU9TCiWjqXpgcGGoFzSRhx7HDzHqwLj8NkLX6s1k4s%2B3kcFNT7y4f0%2B%2FSreu6Sa0D0ZcR77WhEgPQniuGGngAaSRpBOD%2BVbSicDYfvB4LkqfhYQwbo2VUEXIfEeSTtl2vS97hXFEWWiVWSoI839brQ1ad9ZPF3620XZI4YkPmeTHK7GsexOIX9cPbqhkmG0mjUcpm3JRmQu4WlhlGaljRNWJYIJEIua1O%2Bt6lTvcsFW58g%2BVuVRh7g5ArbDCQMhMh%2FzBFwXcInH7c4p0ZhFE%2B1YIHA3oZwAjQYXcDZKorllPEf5xPVJ4q4avjy7rXmiFf1Xdak%2FVKwTZBgaLNWz3IX9aCDHnjAXme714IO9JEPQq8YfRdleDl8mjTCkKTzcJFPZhaBrgpp6cqoNpkcUozBf%2FdsoxTxArQTvITULkoPHqQRhCOrjwFyVO6bPOPMNfJIdqvQaw6CDENFFO%2FK6RQjG1caBPELj3cIYKmOCzAjAa6Xx37bGbcof4CFDkJzFGH20BubldXuWUwGyxydeOEfoXdpywbFw40wr3BFFYdtpc7nKnwD%2FAMtTMLT6lsR6xKsB9KILEtMKQkE6r5PnLK%2BrGY%2FJn8%2FzJIwoXP%2FYWKq39a6AGx82pCHTDj7cOnyx3TUmVLw83wjqg%2BzxL7p72ULJlvElQthwIK0DU1GoEbgTgSZx9TZD2QGaIcfUO%2F1Mb%2B5QYeNN3sVse%2BvQOzaes2dcc709JhKh9hbaH8rhlbL7TNPB%2FewFQCobqAW06UTGzFLBECtODfuOnEO%2F5BVr2JRIQLm9iBstTM%2F%2FKyc8GsIeuwyiOxEj0BpXBrYkjTAM5Nr1UjWAevfKUW%2BSpZmTRQVF3FesN1mNXqqtWj6FhJL8M7zF%2Fg8TnFVy6wGqRFTY5lpx2i55SH%2BQSrtFY1hDTN%2BimN13o1viYpixdtghgotQ5NFqPR1%2F8V%2Fj3AdFOfXXC91klfONOtI7ZGsIi9PsQno%2ByVNjgiTVJkUId8bXuyuwpS3fyr9kC1RnYSEaQPSszwZefpVnaQx1vBJsGjhqdSqFlOgm4%2BfVKOgGt5nililVRgrE2j%2BxqnQBnDEMLqvAThCLImm3ZHj7QU7I2w0DVE35DWnCcOgQyCOJ3ohpeukosohkCjU1oYuhEvSmYbIOoonoxAcD8vRqhTpvNB3SSCkcVTgdxDlhrvo%2FdhU0ZMu4w2odr5kHA21nuURlaEWNcHZdtgMZBZGConfVMbIMwgq8VsWIXOng501ApH%2FqcEsbgxqAWSuWbOmGGJAFaleSUHJCtiHrhrn33%2FcRJnNHOaxqvrOwQ01gW9sg2i%2FEcKdWY%2BWn5vGhmSKXSmmTUKfm5e96Lbo0BvqBqOQ7wl4A44pP4AMPvnaSVc2q8aAaAU%2FF5JikGI8Cm8rlxcolZd6Bjp5adnoUylwJ6Wt%2F5U3LDZQnn%2FOvc6fk4AibfMlyJWUc%2BPmggDAD3hnf8ZpvincKIQw2TH6XcPOK7zdXcfj2L82FGuYMzPsMqQtOu9%2FJYB2jn8XeWyHOH3HrLwue4q%2BacxGcFiU4sh8Ir4bG9IeWV6lD2sVcssm6%2BkcU62P8x5DERlSV7VVoE%2B8d5KN55Uhjy3RloHpFZiy0QzJ9ztvWL2QB7C%2F8XCvN1X7xhEiivY7R90QT6UAzBq6L9rzY7WdM5NraS573XX9WwDN8eJdxl1A7DmGqLkZqQ9hZka%2FraDwcMEFQY06d7a6GS6X3DBAGYTR%2B67rpCnnUVlZtSBk2z8Kvt0qERKZ1UNuyb5pJBvB5mDvl9VWvE0wG%2BMooo4tC0Av3xlGasJw8yKnsiwIRZQpDAtGOLodnS7CR7rEvpY%2BlwA4mG5le1G7HdWiuhZ%2BDbp3F%2BIiH2jVFvP8VM1WzcS5uO4fKU4XtS97eofWJfQIUCdmiw7Dtq9hj%2FafaX23NiSwiJUH5QlodWBM%2BRTSyCuw92f2AxbJBZBxbziuMu9QgJDZG3qxchN%2F31cONAMJGJCznnWvk0IQp96IuWMFHeBuJ%2BdxmXx4P08S%2Fi%2FRlaP0j%2Fwry0pBB0E76OKWMvNEcJawJnlfekU%2FprG2%2FYiAB8K92RuFUWBh%2BRmg%2B7%2BIi9vWZ1dT5wHTSXR0nhSlwyiipMyd%2FmJRxLLgv4idUEjsnRMUxC1Mr3eg2SH5wzrzf9DQnmm2ShUjjzfZJL0L72cIEeCYSDvHuzAnQQq9JjvKMpUSF1JkxqpGPuzKocOZV5nqaC1pJ3a0Vp8KW6OF758h6upcmfwGvkrZDJQVfhsT0Lw5Ln6f9FIDQBwkKJeh1zTBdXpKoRdKHZ%2BrU3X4ZjXwvhirep7qA3F2Jr%2FuYVq1C7aSVt2Oo7F4u9UoBTYI0eQi1Z9TrK16RIERmA4cBV%2BorPU3ZKSijL2QpX4QNvo6PsblfjzY2Qe9ghXPoYB%2F5SU4Tl2D%2FnIX95SmQFMpJM86nuxGaan3k33JIHLsI7VptsEmPtTiuy2VaQKTbGwpAGR%2Big%2Bmv%2FxAtg3oJ1tCQhaIFVTCdUMLfFPAJAmYnZjV2o1RSwBLtMeSA%2B3eUzvZD2q%2Fltb5%2BlnX1mqYIXMFLZJOxEkZuRgU%2B8UMsR1RkvkeOIcwvxTpQzGRXdWWa3YQHaxk06rmy4G5vSxZTymGjH4PqzpJiFffna4NxYJ%2B%2FctH8nZ5Sch0XRA2Q3BvhJNzC4M%2BVgaWsfRl5qfG2Ubh0tn4Z9Rm0qY36789VN3%2FEmiD6kjPOBCGWKjpe%2BlwiZnpT4M2zsK%2B%2FCOO3miTE62u7%2Brl4skkv2DrCbipRKnoUZhn6EdzKXOoidzRwGjN2y%2Ful%2FoYSr5weJJ%2F5NVyMMgLyG2rsyF0Foi3EfEHm9mfjjkZHqamGOMGbWpc4XyJkU%2FltTaFDAektQQU7oKzB%2F3XNzJktMZIO07j7Cvz6bbTDZLjROgmne1OAZFAjW48BV5gVFfF594ijssnoQ97gShR5R3XeQOzBr%2FqZCZywgjdordiFpLM%2FMaRw5gY79IEGj4T8hebAKAYYKUE%2BIYWfcNGSfjGppEEl%2F97atDA4QU5T9DfpJTDr6U0qhzF%2BjNo4nxHH2kv2C7t8sdXUTMX%2BGWzuQvUJYg3Mhvzl1fMqrhlNbnWqKNVAk7YXZYLj04pP5acDRjBq%2BS0X0XCEGErwUW7zxYIZTHRRIrfUWDqF%2FP3Btgf2Sz%2BpKn%2F%2F1i1P5WLulzaGVOoQsrt57ribf6qfDl9BxhAlA5%2FhrCe%2FAJrgzeyXwtLTmNXK8XuIfO7e12Uhly%2FQaNf9LLY25aeDHSvLuM%2BLhdxozJ670D43EgIhR5qH%2BuOajY%2BMW%2B9Ov%2BPbCeFmEUDlatYPAkpKY4lCkZ6Pl76k8sM9Qi6k43sqd51bnghGPg1i5Fv%2F51EvMgy1MWB%2FPn1rBYx%2Fsjv%2BYut9oUxc3F%2FMDvx0Ofr6QcQZDCqi3lVhPOe3ZeXIP2FV33n0SzWcxKU0Bl2pmIBgtzFrpyxsnzs%2BXe98rjME0HjFa0shNrhujU20e6rw4uydWZF%2Fjuvge59gbdpNWNDEktHV17dp9VDvPJIVREm1T9th%2B6%2FFO4WsH1FX3L4GSTjW5KSJb5UxJCol2uJPAI1DX83BeJ%2F%2FBXLd55ZgXqxwAH5GYL7WNxVrfF4kGFlLSvj1Muz8VDybpl1e9uplxGXeUHONG8AQ2M2Dgwjs6NBSwAKKlrVeRtoTjJGIfXGLpI19rl8xewlMEsIut7RJPnkVTWSo5HenK%2Fj81zDtQHhb%2Foy67uqMx0VrKywkCFaK8eFR8130APvGO9auCjHBJzM5O1VKRIkhQVlJJLZxs9SnewXVbnSnIFmCWzYoVgAVoNKYELlroIcopYWRsBTxPOI6OV8RUsWlJd2ovS1gK4GTc2dVH3eWf4NENfCEK1iXOVGqndZdlhcIGiJgRp8IM%2Bq0XrD17AqVr5gip%2BPGJSb8MzoNIdT1cFOMB%2BWT7CNZVmZRGo5UsAV%2FZ9P78%2BfDsnGTn0lkmcaBcwJmmt3%2BiKwdHpKuuM9raw3sg4FDCEUve0RPwfdilgLVZFpzseK8R5erPryPJXXJObnnRBmj39tftyfVVXfAXtNdXeZ2N0m2rsnk5Op2RR61RDxu7BcDcTSVd0krYL8FXUaQMzXwASV%2BeOswKFZnOolaBicYpffWnqog8FU%2F8l8uUZGSgz9E6pOF9zyA8OFVGHI58sckUOGYmEaoKsy20FT5C9VmDWwUY3c%2B5lOH4buvRaoR%2BI9G8BBmtiVtkcnIUo0nlgKkBMXci%2F9Noqiq66I27Q545NzE7yL3cXBfbI%2FnJTpvw1nTQGAkLeanC1T8EbDifxpAwuMs1C%2BYvX5N%2BbJ0OgbAswN%2BQml8M23Qy2ifupG7uTxdsteby%2Bzc8MrjKbe8Ol2OeoPgjMzYX2Mdz5kR%2FW1hlEll8nDmgLakIiAOiTC6bgtWqNos7vQQll%2B2KbnFyspx%2B1jxFSybnxnZR8mFlpwMSMSxOs6hbpzjCUHgDWYgwOwyqyD95TwA0GVmDNBOMuOL%2FQMYv1j9JiPIv6Rvb52VFkMwDQrZnVcuogCntwZvc2SshpUB9cZGs0IpXLTOxuY%2FvMacmpkZxouAtsGI4KjdJvzjAVCsCdPfHHTMcUkg%2BFpBA%2FmgLJo%2FdGATZ7s8ILLafFsyT%2Bo3mCsQfFgLAGMxF3tqmyL4%2FxrnirlwYT%2B6QaeUgXkIj%2BJOY1lTF1tm5%2Fta2S6Tx6Vw4ASOBfqBfopm5s5gK6Rn8NZ3d1gIba4ZwqO9tdySC%2FtOyYQxlA1r1lE3N9gRP7n%2BmOCvoMKWYBh565YffMreeEnyk3SBqkuuralR4clW3OPKgHrbhNir2rvGocE%2BfixVK48JU%2BqfdEUOwUiIOWSKhp8SqTX9MvYU5sSqyo9G1r5nbGUBPVj6CWrn7yBJjnRQCbsEFWpl8tg2voGU5IvWi6%2FI13b4kc7bTz4KCdNGL66vsFV8Xt%2BxZ5xf%2FVoFxPlM%2BqpA%2FP5z3FSDgDLO4XbTkjO0bKSEJpJ1kQr9fAmJpUZcCEWsEY%2FiTjhnSkThVzqirHCEQr00ujXsnjOJIfr0%2FXW8PVHifbd3x37CU702yMtaMiayOqyfffEk3A29g4WZoO%2FE%2FWb28TATD2N4skcFUZxf3cdwz98bMwtZJkAaMbR8OJCq4W4mYXLNVeyV8aqNuFNOl9RGIVCjPqA9uJ8rJuAKhb7c6BV4iqwTwoPm2xTyy1UjzxYkb2iHvD9pzwDrZC%2FCExXku9yVrcqXUw3NdYxjg1KpCSSy2Hm76l5uvlVpyOxcPRLF8ZG%2B6FSOzt%2BZgZ4LYYK6zdZ6B4NLvkdFkJRligIHpkedyfN21IE79yIpV7Npj3kjX2buqBfj726hRTRKSCYAWcChUwb7tZFjPRIbsAeUlJR%2BlPvt6ScpZVWUyLMvt6Iv8LQcTw%2FJPe8fdaPmZ5EaJ6jd58rA72uMBxQBDu1eFO2Tgz4kO1RfolcQ8RKm1oKZSloHNqGFt10yykka6MiBBvVfIwLCwnJR3UEycc9YFOshO6geHbSRCWfs4Z6%2B2BsL78qu%2FiZN6QdZenx17LMbxiX%2BwVLoQfugTaLfFrUjxNzN6QyvUOVpIKSF7ornFNTq0Mbmrvs41UPfEXQlPFmnYwGHJ2rpXRWKjd33VpNKWtx76rz95pPe%2FvRsB6XYH4DBlLdMIcbuDdg9R%2FeEkH8qrsRshzfMB90EWL2%2BTCAtyx%2BKNuWUFMke9ZZmSThwJ7NLZkjiF956pkBWXQDX924p219Pm47NOox38l9VRE%2FqEu7UefqBLv27Ah9tCdi4L2JCP6TXQsgkR8IhdZULm84ludCrA1cdxLd2rvejGFiyZ9RiYYB4jhETcS244tvJVpP3gxvXvg9ZWNH0kpvGc5jchai4lfO1aBy7DAc91TRUVPshAybRI%2BxiqIRUVkKID%2FIzejUP22c%2Fi9yI6Sm1HVF2FH2%2FpnqFSC%2FA7Iis0MBSvOWl2EtnFQkb0hoQ%2BZf%2Brek8ulF7abK7b5qFOJjI6ISgQPa63fotESlBtfTiKpVMulBuI87Da7TbPB4WlzicctlIuh8e2tC%2Bjfh0IWkRP3WziFbM3IfnbVFpsJQ%2FN9rgBob5w5gKPEYST%2FvbMTFcCNI5%2BKJmYTQcU%2Be3VrzthIvhBJ5QSZqTCWdvTx4m9qrXjakbp43FJI1A0OlqkQcwHTjwtuI4OGp9r8JOt%2FXgz3eBaNYD%2BuPd7tePbuvIjbQcojQ0KIASuoSvguZRpdNJvd6QIcKhDfwORBVem5OXlQhi%2B1apuAxrXXO2BCStWgTTIxjSl3ChZtry3EPfsxYwceKSU%2BHr1mpDvOCzGgGiDIxRELVZ8LYggFAIffJp7SKy81IfvCID0mwN9poxs1JcHHRX20py7FZ9dnfemBdX1ivy5i5KMwniRDaw4C1Glpv8%2BMg3%2BGnp49%2Be%2BZcZxCZxLXau4Jb43gbdDlXXUwyD2avESiRfSoKR7gsXE3dgl4zN%2FFtbNBxL89E0GCE8Ue0wpldzpDX5k%2BbF3Hp8p3xv85hUUMX9m7W3lDpcujMgQvQgPsietFYiuc88ZhIQceeFaDTnSARr0f%2FzaRbVaGFP7PdiEBk%2BvcQysxpraU2w3qL3V%2F8PPN%2FSaHbY7RemtygNFxvvdD5RwvW2NgspFUbahEKR0Gq19FCGuB0JMmPeGtZNO1YRz0xQuz2iiVLHpGuQoETnG6R6jX9FD8cyUyvMxO9%2FnngQFCiEYT87X02FDn1l8p3AfCmZPM6GkSIUN%2BIImjLL855RIXQ2lsVsMXwqVtrdIKiYKxidDEAsa%2B1X1NrMdbkW%2FMo8YcDHIBOZ6t1NhC51GeGfHKTK1PqaMAf%2Btu2WlBnVAevd1TMWSTJelTAZZirjeNSFn%2F%2FsSOmmBZdJLUVkxIBtWoQoXTDFNL6KBnsybQMMaV0YQbbWv%2BNQ3yW%2BF1SguPCIJtk1fE8chkLreLu82e0svSsR0QE1wxYTS6Pif6o5vhxJ3EDWWm0tnN27lqhHwpGYN61G2kK2Ge0guaiquQz0URXHZ5t8g7Aqx%2B6NIQO2CMiGDMjpSIbm5K8q6mBFTg2x7ALMiH%2BSJKSO2KExhMSkH0aoZuvY0obiWKZTFxRaQRjirB%2BRFfGqKsydt6NmuJYVddkTloE1f7aeLZ264sTKNhJH%2FErtieAn6M%2F9AQmxfmrNRMnS6wxbDLyPsKRLVz5LWGKBZp2nkgjMhasDUrxnxUaOXOT1SNH7e%2B%2BBVEcYUnIewb%2BgOfgQkVu8Lr%2FzNLiRjCKKcMmxZ1hx9%2B%2FChYliR5bZ3hxx7OMGMJ3orAEt%2FtSvembMLFtKkF5cXiX7%2FbaNhNN%2Bi%2FMNah6SM2%2BLLugjI7D7AkhRk9mobnKIWToXhoQFQ4bLoRmI88WGZ8Bl7CqH6h5x7ynBl0Kx34FaywAydkhg0gjqw9U5TbziBuISV9nS7wsf9uqI8eu92ykqgXE0PwMiMQT0VikHM8SSpzndxImgXMEKJjYoJa8MVpuBlnDRCQSBZTzK2WmYviVOdeDQYq7%2BQ7q5uj%2BKzSUFgNwZdSqVuFcbq0413ynX9YvSJWCAlWKqiq2hqNcKUJ7haHfUAKyfMb5E2X3VoHvZL2bCGbCx8WRDHhsffodz3J0v2p%2B8lVZPq%2BpyjOQM04PGgVKUVJho1vehpwws0q2HSNfZSVORdcL%2BIQwxcNlhwnncmxVXtA04SHu1fZYnarUnIPw1N2MyjHPTLGSA7h6hpj7nSWZFRu3p0tVbErWFjuZIXwBXQnheRS%2BkbLS8UR%2Bma%2F7ZEYtpydFMQjVLO5ZbfDxOKpSiHCsP51sOIRZCYCIGQBR47BAvuBm7FnC%2BLss%2FtqGj25OiDcKqzTnA6H5QenwBnf1DBF9lZaVHd%2Bdjld3Gm1WO6qNrD3NF51oGstRZaW9zAMOC8orp6SWdd2oShZ3cdoMfq9BhC9DD1SkPVCUw87FgdwCHLbH7a2pRZWHeqSi0WqPYxjQuJPaNWFHDm9n1Yq%2FYAHooJLXqYQ5JPcc0kHh2PlTQEa1HXkWvEVHe9HsGesngM%2FpmqVUHy2dFa3aZJUgXEiXvEMNmA7LDI6qjwRqyq1lsP6Ku%2FZPR6VNbcVyCgcFpFCgNB%2FNeVg%2BTy8mlTsDKC%2BnLu882EXUcciHxuJk7HwFtJwdDznDgQcfzn%2FJ5UC%2BkrXfMzEvZAsLuPt4GDM2m74SVXpGDLLb5jWc7FtkBxBxX9qAxB4cnhyCiFeru8PkyZ4Wa0dPi5ix0NhBHlC%2FefFrezrZASA2JTmW54Qp1uhoVLMTU5kjn4tdqnLBiysexECXKnvJqQPs3ZG5jaMd0y1WUNJsWtOYz1Wde9oYjZ3qFw1IrijLyd5mIrun63USy%2BmPbkad3vr7KrnBPoDwS5xSw7SbQa9bOanCGAfcutam%2BuFPHXsHwP%2FICkGWa3oEXyHCkMnrOxN0izYqgecNP2pNzy9sZQ7hMgJBcttrKur%2BM5aHl7ypZY5S1maCVm1Cp2lN4f4FzhDzY2f%2BE1s7fxc%2BbhFORUiZJLZl0OG3s9v%2BH4uuzhk1pTjA2%2FSR4eBZmrDw%2F4O3STpIanwJHnSaozGpgL%2BkNY42BuhZdkUFRIPJBIlGjGynVslIZsucpI6spFtP%2FbglGNWfxmJxyi9r2KEEGl7I1bp5DVyG%2FZVfNlJswwxbOZR7EzqHNsxqulT5FOClwgo9S9pOJgIlRLDUUujBDSd%2Fi9QYsuAyV2cS7sL4S6VYwuPeSM05ILJfNyV5ru1EsjZFB%2FgcQrtxHe%2FmkQwGTVHoRQC8esDFfWQTnipSCxZPtIsTFY73t53IGpD2y8gogdQiEidwm4bfnNRKZus%2BkH%2FMjxiI4cc5Lc%2FB6ZL5Ks0bNyO12TeZyBpegjo%2FVeA4b%2BHl4D%2FXpG4zXu25ppyXWoj3ldRFLu47itY4kbNWgZ%2B6522PKO0WIYGf%2BazDsIbBrllRY9nmnC0Inq3vjCnc7NYd8s8LUOrFJU6BEdXgyV0kLV11Z89QdX7YBzFL3RJeUeqwp3QKUgQJKRuTsl0T6pP4zS1w6O3E%2F8JC9HUY8uhRt7cUB5p3mAlnJwOPl4pwkfX5NNLxEH2Ihsan0gdmBkeaxzrr1TFQ9%2F%2BseXr%2F%2BEmstGmeM77GUjSSitQGHD9eaRv0gaP3%2FI06fyJk0lvD9wemOjJllsWvDauae88IFFnniohlYYkdyZy%2FbjORQELWZZJq7sQ%2B7gymwab65A8DdaZrPYYmWTDFazNEPHMvA1LCoyOkeUU3ho81eA1g05arLMlg3uKoW2BgGTF8y6yHiy6NBhLfOD%2FGe190S%2BPmZWi9qH4TuDVIEf4LbGXmBtpWm9%2BB3eWDRdRYVS5UFz3imMhYDXrAYAowy1pMztB0H%2B29gg9AitSM6rkY0R%2FNR8plea45o2Nsj1b1L3ic8PDb5DrnFC4AgmNXussw1vCS1g8hIdyKR%2BXPefyeaf34S%2BWejjwKxStwzEdVr3qYdQOWJrBXrN2kH1ugAUV6PcThOoymBrfxa76PrxWSR3hUJClW6YwbGEUXscy4hUlGVKWNc5NaWaZkGqXihXaD5hkBB5gh9KlXk9XBleDtlNnQqaYSrKMaUmNQLhoO6QzrMmVICKQFtPr%2B0KwAI1zA1cXxojatxbfe2%2BuygpVRIUVf4iciXpn%2BwtFk4HEO%2FkAqkm2Mi7Khigoh3uLIxJb1jX%2F6i82au70F9QLaWiD3lw4lIfYCB7hcXR6WmLLcBpK1O6z%2FsbFr35qA280Zf68yt%2FHBYiyAtv%2F6XmHFItzSy9%2Fcq9H7NS6HwAGwUPgQLICAMcm1fthXl%2FfHmACjOcn7JBe8nUF%2FQfQR2O0cQzqEhhqxHzFG2de3dTVaLXFAcAuPKt0Qa65W%2BljCpSSabBQUU7EGtKyQrRxgL1d%2BcKuE6U8iGLGqOO2XTm4jnIV0EEKYgEJadtBd4kjcN2d6uwMYkg25%2FId%2FKkOJo01l1SIp2FvzasHaB0OepTv%2BDsTNm0gnGYkzU%2BrG853KQWKGk%2BgmdvGhrx%2BcZP8SKbGpBCPcTjJAE00hMSm0I%2FI%2Fq0EHgyQcnTI7oBJU6uTDWgrAc%2FOliQ%2FnZL4vfo1iv%2BZ7sMos24SCDfvqhc7HJZhRK%2FpdIHHEh4gpRFIRFc%2BIbQ1R0NCcg%2BdP3kuXPIIiGWnGB1UxUAbskIEbZQS7IP7vA6ZEDC9T4zKjmbC4slxEmtm4rz3LICeQiuoxhGH4j5a4sS7PKV3zH8PWGqbGZ45r8WS4unVree5aohFYKiKtOf7j0TuBEPb8CTQeFp7oLOB0AmWKvJIg4YMhetFJkUdoVwpuaYdzWzBh85X8fy93ywd%2FUrH5N4zCdhXWbUtHjXjqP9KsSOxKDfAPWrN%2Fkc5wWv4oLI3d64ClN9Ijnv%2BuwvaTMlefmI2jkLaXJo8%2BjfDDUr4Bm7QVqrj7sKG9gx0QqawJG5fjniH0k1wztRMrp0CwzWxlJyWc9ngIfwcj8RoD4VwQB0QMPqQ1sELdC0k7KeuDwMOiS13PwlWG35PGoq824PbONuju0XZEVaTmKS3UXLS27E4gQOmDxkfPw2J%2B4w%2BFMXmXyZascbtAuMklfssCK2%2FK2oO%2BlU6ujLL7sKmN8VyfBxke2%2FguJB9QSyMX5jHJIGh%2Bz2y%2Bty%2FNQ6UgB6Um76sGHytw2I2QSM1BL5ux6ru3L8CfoAFkYKgw%2FiCeIYz7G0XeVCe4lVoOwPzmAenznBvbAUGDLzTz4WEKMG27qy5ZWXj5UbIiDnDmOB9jjLI478VCFKZpkYxNSbZUEmdLCSgXspZdCSSrh4Ok0ya0od%2FRwOd7DuTRJFdgFDI17oGBxk8EzNIahggg2kG74tIrnErBFaOVveA567aooI61R812beW09yLBNIAwuqtUnx7wI%2FcVIJID%2BT6qAXK5OJrjJH7OxMAaDvsDVgZAYvWado6BkKLrmanxHnFLPzx5tZJ%2B4ZIy%2BAIUu5rVkxJKyNUuRMxuKICepacNbQuqv05zhKUjrAKsQ39HLOE7Uaeg82qur7TdKMZKI1VMvYoPrpG6tZwpnA39PFuwHf%2FtVQBbOHMa6tYLuLR9WyYbcN%2BCE5rjADzKeDRLkwPLsSWOFeuUzuwY759xdHNV%2FA%2BeQGPFqIMfBpKkXBBh%2FkDxNzYCY7W2fx%2FbpUjnIU9pGdflYb2cJecJGXon0uKCVaNwo69JbVkyTbF99XaiEVSexJYO9YsfMf4pchd7%2B%2FCrUmpAx789yuc9Gm03kEDIx5dfaeJheL56%2BhznR22lRAc5z5ugiLhbDJ8eN1lm8XkRD4RIMKr%2FL1SOmDsLJybdV3lIX30f5XBYbGFzJZ5qpyFjMqI0XNcJWzKXgVPW6L1gqoNBT%2BmJLDU8h4n3GZI%2BqL5CvSoj9Udc94N5zkVRcQFtOGg3qZQTJVvUdb7BBKa4IAqfU%2FN80%2BKBmlZDHGcOmxSDI7oidv34vh%2B3EF5JfTMpM7a8dYLd4iP1bZ7O07xjj4zAEAF%2FghWxKZBYnL29mtHCLfD5m9G4Xpl7QxC61a1vQbljTwp8GcawBkVJ%2B7w8EYXx3owj8e36gJXPaH9SQYjydU4tz0x1CoTl4pf6dKlOuZVzrRiBpZ55sYQ4hOHO8Xf36nzFFoLYFsfM%2BZjoou3ZTRcRsI0zedYbApNXxidkSA8vxgk9cWevILpdJPTuBa%2FB1ajl6eCYuDsSF0RYoHq1fvuduf%2FUmBKs6iQTNanelDAzUsucFIjILJkIcQR6X8SBgCfcY2QsxEe1FOpyvsmJLjeoBSpUomV7Tibuk%2FR5BmJ9x2daeD9DSmsobw350tolwNOai1BoLa1FXjdR79XN%2BLDoX%2BHMUoGlrOK9gIlovoFDf4TLL9qfO5xzhBDJPAE%2FeaEyCgzRja4xPESkSeNWoqpC3ARhD3OCCnGpS4zKYPW96CAcGJQxrY01U0KOPHZ61fLd1WEwniaU3hATA0oS59xhTsA%2BhgYB%2BhaljpNoTW0VzPkrGedhFv5z2KjowEz9dqWn0lXYtwy00aw64%2FVc84o3Hcqu%2FtWFQ4zaVCa7%2BZTUIJ7iAi28mAE1vWjPkPANkb09WOAF5jqgUnioV%2BJ9ed02Mf%2Ba1VvRBOMl9lKw%2FVEKOUnNsyyKva3tZMd%2FcUhoUkMpCU9fa9I28D1ClXcGn2He1KRf65k%2FrYFKjJKGzLe3ch6wezAlv51ApyucwjHXSDOw7Rdao8ncHh%2F6xRrSg1YxBPrAqASk%2BaZyFCfciJJOoLfWCyYY%2Frf7ZGcOexQAZCxD%2BiJ6N0EUmLb%2BLU0JlrUVDPcyQxcNI8z87OvIQ8y2hes%2B23r19Dvhep4pcbgLnvQRM5ICRJPiykXWoEudtS7q%2BTI5fEKlJ7FXyYpgF2jeKPD4%2BOx8iR1jkXaWIy2sSDI3oqNWpuBf3OyueJtqjNZMip%2FiuDahRsCYFqG5tZ9oILbbX%2BrEyj41mbghTz5%2FysqN%2FTbGEdmEZDaPPnlzYHFYbnquSvkpo1mzFQREsym0Ag%2FtXJ6qsvXLwDqhNhOz5vszPs%2FBY9stT12WA3sjb91Iemr3Y9UjKMbuGpIjqPZgZbYMj%2BwdTnIsdWt0V2MnS8uPwtXZipxoCIfJe38pKMI%2B%2FRptGdL47FNJ8AhjqAcDgQLZEc%2F12bAXqnuq5C%2FJ4c2NIGxLg14Fhj2%2BEBLcGb0O5g8raJLPEdcuRqCIjhBPMuSxBzcf4zRhQZjBbc2xLECAq0qLTtpNGgLsyETLlPxhXAuBl96bfxBmPloyYOnzObfBLFlsV8gRrgXYKDTJQ4iY%2FwpHeZpqu%2FEzoyloGFd9UA57RkxjVDZCqwpZs95fGbo5yfUCEQb8B%2BaVK7tmN6Gseb%2Ftak54pavM73xcHJxPbQta%2FqBjNSTlHxTOK0JkqN2a90UmvVzdU9mHmG9IOcFjqN8GaC2yKHCWczZr%2FFhfdBoHNc6wu3IBFr5T7PNVB%2F7HAi1540iF9Kf7PuDn1Nn7rLrdp40s9aWEL2uMT7losvo7muCAwxbTP0Uf%2BPhtfvx8MEEa%2BqInIOJYIRMxIxUqgIt2w%2FySnVFH0iSNh6Tq32aVAjdqt3WBniBhtixI0Uc2qmqu6lr1Y0KAP5hCPSlPrJPqoLvTAq2QU5LyMPkTuRZ27JXb0dyJ4h%2FZsYecH6HJhpjSsoEN%2BlnKwbuTIUTusNLwrc%2B819K15m3CJdRqpbyQrjBvvVWxiCH0MtQ4%2F6ZgXWGOG%2By0BvOHSb5RBkg4YWgafyUjzV0ARIy3kBf3MUbdNY%2BrXGi%2BbF%2FdZoblBZuxxQA%2FwE5gL62ZngtbbP3Wa9VEJ3AqjYIA%2BlazRVPpmpjt4fD%2BIUQbkljMiUtSTXFuGHY3%2F4kuRqZaWKjWw3li0xc%2FeX0sFecT6g6RCwBwTbOCtYFbTsuxN13knveO%2F6Z9bsyJa6%2Fl34Yshw4CkhqBA6gnJgGW0h5dLEORhhMMeQHBdBkSUlRTgrbJN2rwu8vIAQlo4cMC5oTcoG6Tqh8YTboCVD60gqtJ%2FVOEA0fKk2t4kAFT7xuLpvmqBbsTWkkJ%2BelUQvBTK6d3SDiC6t5l%2B9qifeJgmyK3gnzJwv3GDJ8i9xNzEuXn%2BgMeLYU2QKcbUx%2BvbowJ3XrO1bCcPdCSbt5iCKlr6i7Bxl7vWQfJvB9Lr0tJdUU0nOus%2Fg0G3x3wevTsgmAp11rBsf7ugkgU7vQoCjy7t%2BbjwC7r4pPlLgnmDxHB7iHngsv%2BHb664ByObWwwGI%2F%2BH%2F2Z5DrMrAqfxW6nLGdQ2EFuZQQNS%2BvRVhZ4iSMYXmRCH7O6XJGU5OfE8nRPwfvDKudvMEKd1JSXoNOt9jG0wzZ3Ce4XdPt%2F5F5P%2BlkXyhaWBT6gHLBgYrBp1VPNLgOl7hb21MqMIxC6JzIho5PTo2eruUyNa238MAKUhtAusWo0fFHwIRi7x9ziCrZGp4lyhd7jPBrMrz5S86pQH1nZ7YjVq5YA6pKK75Ddg0CmnWw3X86x33NnVFfeplvP6cD%2Fm1p95pqKi6%2BBTLYJzyuOCURFdDzIjBTNLDFwfavuEUUmLspPI%2Bwz18Rm7o%2FTesmFHepGVtXwsacSNXm0%2FLYxoUfEXZ7pmlhjMaqR47Co5%2FrQQkzvNSCI7Zx2H2ty8ih9tqTclW8mbulfz6gu9CaAvDZyjxaDmGbkMMWdgeDAbbMJZwpfZd2odM%2FM8ANU7oRmMaxCEd1dGE7GMBXIr%2B137qIWe8gyiDpW7jLbhk5MDuQHOkVgQL1k0hW%2BFA131KSi7GIYrx%2BwnIhUVQDeJRZTdclyPBOcAWxX1YV%2FcUe4L3W2FbZ8CggIfyL5OdBRhnqFSuGWFLWDXlN2da3pkmUZVkIQFPXcfOAtCKfitHAJx2o%2FnTaKn6JwspC91WFi9mBYcyOkUZqxOhbM01ELBhZoriGEA%2BKfjotfRGycnnaxh%2FGu5vTWyVEIBeEneZy0p4D58WLD32z8W7xgFMZ0sXOiM80zSwIDScKuIPYSgrtcTsXRtqnjtcxavmli%2BhcuYsW0bVanz2RoMsD9dmRbeoXiuxjnTj9kzlzUPo32%2BAaHL%2FsLAFDovx85dXXRcopFSC%2BB%2BMRMa8T%2BDxRC5rBqIeSnimLWULCjP56LiAO1fNgiT6DBewHH8oPwBP6%2BB%2BB5%2B2a4Fwa%2FkMQS%2B%2BdbKBmcYC0Q%2BE5eWzMjt4D1gQNmp1vKcYoGukUDyOpdP6r50QgywCzflDDke7l4T9jj4txmDF6tqeh2Nnwa6AoeyG%2BoIrfkzoyhwQIo9JUdtD6g3S2KolKOoYzYG%2FYU%2F7GIn9w%2BKaE7tRYvkrJxAAmRO4vZc7Xyk2pNS8UtsEhLJJvnawLkxfdnflUL5xQiUBTcM2TnAnLXg30HgyW71ikrDBI76cHp%2F0NaS0U%2BeKVZtxCI0nLZ%2FIXjPU0NEaTgFqzmfATSZPtPljS%2FsEetIsT5gaTQolMQ1sHMXcqVfmCC8Csy9deGITJWQNzuxnEQurGLY9mK9X4gJuOdPDAmeKiZUWfCjCauyz3XtXqW3qpPqTgPopTOXL2vUmWTgf%2FORcN3wx4tOCt%2FrPX77lx6kc5Ifb%2BZ47eP%2BMDfrhv1fwUVLPdQBLFEfcFim48VEWexxVIjqQLmu93uAzKeAqrP3TNNLGN%2BUtiKQXsS6hc7hr7MKIvsRMt0NVEh6FVkw9rhK%2FyNCvn4tBHLtCOurEpaFHf07yKelA%2B9r8xTpXl4yQBRLDRrcxnFLMIrGAX3t0ii1vpNu%2FEgGD3CD0F7%2FHzXzeHhcb4IFjOwysttP6ExwetOPpZp2RqHOw84wU4P5Thlqbroyk8KFmTUoeQ8bcsVapCJSmSgV%2BbX8tB8LZ5gNo%2Bu53CrEF32PkUiOEvKCLk8YDCv1r64jCZgDDgRvzd3jnxbXv5bKq0JpYOfW4mMGMHA1uTsw5tVYlhKp%2FWpvfsNjY8G%2FBdo7q6Ko7VgWZNfe7Y8SbcQUNZ%2BklWmd0ZydzKwj9ZCiYjmK14S2Rmt0DvfYtAx6u5HUBDj09iOuVSyRrpobJ1xvl3rbK3Cs5ck6oMNxoilcu1085%2FrLhcYm8YlvSYVZVGkuAwvsDcLj%2FudSQJUQwC0SGZjqEweD7jtHrzRqIT0IrIPhGE%2BU%2F7SuHZfqY2HG7NVVBBJU4mpK8RRpTfYdyTn5MhJ07K8nwEC2NwBOF2IaLuphQpV3aNlIXQW5ZjLGYHq6F9KkS%2BVBkSS0%2FpC6YHjS5HLooxN8ncm9SYtzEPX%2FCLvbvPPaF33N2CbIlYIW1FqgyCM5feOqa%2FauGxxjyDCdphDp7RmPxVULKXGJu%2F81zmPQ9xqahXE8lsqaHTgCGhpfIpuvsc%2F8eZDv09cVFQh%2BpUFj4bEzQr%2F44fBNVBux8iBgcSk1bpbck4KGP3PQ3WN%2FOY91RAh2XytqAQiDamnxQngHpUmP5EwNka%2B201CkGxy5IlfX8e0ZHnJ0Y8FyqTBK3UgIXim4nZ9vQQnB8%2B68b49aYZtFMe1f%2BOFqK%2FwxnHOwWaHsoQmfdsSHjQVMQjE%2BxbA1yVhGRkmr%2FO7MpLlq4dO6b51qTVd7O7nqW1F7vfKaEV1u1YKAmiFYiJaDPXqIZpqAl6KzhLECxFrrPmfu9caF8U42CfwaI21E7XlYARHOW6q%2FzliwgBq3RbFhbiti%2FZ5StR4s0PvBje3l5F28UCY6W1oWj17MCp1fc%2F4M5FKrEUOb1uAvLojJ0E8iYjJsdO155I4q2RBzar615xHpNpB7QXTOp21Cz48fCYV2FeIMrI%2BiyiMKCN%2F4sZaBO9WTC8S4BDAS52F893%2F6mDSahm80blp%2BkkEtm8Fz2wuQFmH6WKg2m%2BPfZ%2FK9Iwb2y1%2FXxzhJ6zJlFNB9etee%2FuPLY4nwjmf%2BskEnwUAtPDe2Z2v447KBLn3w6EoV6AEieR%2FgUFt6NIoCqssQ3MdeqIImRA5ukZXIXA4CsYiBt%2FOR1hb16Haj3z8lkHl7Ypa7ZcKyBLxUWTBqleLMk49Pee7MWjkF2N1aSbAP0C6F0k%2Bi%2FIDVSI5slK18Jhl2SN09AskXnqhFYbzPW5Y7qRaHPqSnw4%2Byowx%2BchK4o25kCgNBVsVZWcuXBIZl6%2FBxrtv3dtRbNVlDXSmVG2oCM12I75zVPTOYbKVEUg1i0V0IqwIyv2cu1iKcOFvZ4rX1Ugp0DTGSk0vv6lQqKSc5wN6%2BPsXvKyV7I%2FWa0QPSCiYQn5oW3RnHXXzEBR9EM9msKGX9%2FSz9VIWi4UwGHYJpM%2Bk9S8X99F5PLA6Ysn93JvuxNZq3j6VfkuBMVFjPyK%2BMta1wYRdhHfni8FXRVLqO6cm6b1urcLmmHqU%2FPeuHoKIgmCwNh5A3sA0vghLyHbBk8WEXgC9BS4Q28V1F2ZBSoyAHVCGxVy9tLtvFwkEgxo84bcVJUAVW7xk566JbYDpct4pbcMYQCXK7ILeho28sV5kvCixqeXRW2BUmDRZWMH1x99VLPgUfbY%2BYZmIjugZpQiEXkohWF8136hAbeFYJ3iFZYqtbjHD4etjHrGLdad3uRWHI6fPHFxaF%2BFUDBBd8x3jYGSM5IE1PK3Y1OxgQZvZAwjCl8YGUvAPCUnHoCi4BtXmgkmpJY156PO3136w6CZPdR8AiCV4GwO3yXCGLiNOZMp9GBU4UIVFX8T0xrz8auqBdccDy6ppMe87VZK1xdgo4e7PPNlZ87OEaRoov5d6JEDbTV4KD04yh3IfG%2Bye1DGWs396lrKUoJ1xErGWFQwvb8b39KzrcMBcnCqee%2BqKq6ukX8Enr4peCQRa2%2BOby%2FUeQTtVnVA5D03%2FCtMGsiP2%2FcH22zskVhEj1M7HemaFS79Iz4F%2FxmGhrLAfWFM%2BqzI%2BcnGYxusqG%2BHD1%2FMOUoO%2F7OtoxP7DH7F%2B6e2XMaNKK75sIsPDtNvFDpdO%2BOI67gILnmo2WdhmcM6yB%2B46vODl2Qgneyp%2BuMXmawNesguMIxopM6FWWOVoyb3bQtwcysi521OCgiUpM2f13OACmhL9rssvU%2FoComZJOWkjHMpsGG75qN2fX%2FQaZFlcGNI5hZcSOMDBJmRNeCDbYj7RuCpffkV0tNx%2Fw6bi22JIJwvJKPSi74otVlLuX0QM6mQkq42oC8Dnz11dPdgSF6lSA4qUjmb3EtEUOuG6DBBix9EiktX5pWc7rYjc0mDJQEwhmWgDrKV8j6ndKK2i6Q%3D%3D&__VIEWSTATEGENERATOR=BBBC20B8&__VIEWSTATEENCRYPTED=&__EVENTVALIDATION=20Rzv3EPd%2BrCaJf9Bl6w6lO24OAaU7%2Fzp39S13nGXIcUhzlHObJ67oJUGQcg%2B24HgXAzUf7Zndo%2BxyeMNTRwxZo%2BX0yYz%2FKKe2tbEdBEqL7MkM%2FLsneLHzh7GTBZTWjMRzTQCfXsVrKRDlWI77QrCgcJjsq62VGacdSNvMJJjF%2B0IsY9x2zvVjKhHXEPVnvitk5XCpxSFblX5NQgWeVVYQ%3D%3D&txtbSearch="+track_code+"&txtVoteReason=&txtVoteTel=",
      "method": "POST",
      "mode": "cors",
      "credentials": "include"
    });
    const text_response = await response.text();
    return text_response;
  }

  async function scrapeResult(pageSource) {
    // Check for invalid barcode text
    if (!pageSource.includes("رهگیری مرسوله به شماره :")) {
      return { success: false, message: "Invalid barcode" };
    }
  
    const $ = cheerio.load(pageSource);
  
    // Helper function to get the next text after a label
    function getNextText(labelText) {
      // Find the element with the label text
      const labelElement = $(`.newcolheader:contains("${labelText}")`).first();
      if (labelElement.length > 0) {
          // Find the sibling element with the value
          const valueElement = labelElement.next('.newcoldata');
          if (valueElement.length > 0) {
              return valueElement.text().trim();
          }
      }
      return ""; // Return an empty string if not found
  }
  
    // Extract the tracking number from the input field
    const trackingNumber = $('input[name="txtbSearch"]').val() || null;
  
    // Extract tracking info rows
    const trackingInfo = [];
    $('#pnlResult .newrowdata').each((index, row) => {
      const cells = $(row).find('.newtddata');
      if (cells.length === 4) {
        const stepInfo = {
          step: $(cells[0]).text().trim(),
          description: $(cells[1]).text().trim(),
          location: $(cells[2]).text().trim(),
          time: $(cells[3]).text().trim(),
        };
  
        // Check for postman link in the description cell
        const link = $(cells[1]).find('a').filter((_, el) => /مشاهده اطلاعات نامه رسان/.test($(el).text()));
        if (link.length > 0) {
          const onclickAttr = link.attr('onclick');
          const match = onclickAttr && onclickAttr.match(/#(showuser\d+)/);
          if (match) {
            const moreInfoId = match[1];
            const moreInfoDiv = $(`div#${moreInfoId}.moreinfo`);
            if (moreInfoDiv.length > 0) {
              const postmanImg = moreInfoDiv.find('img.postmanimg');
              const postmanNameDiv = postmanImg.next('div.text-center');
              stepInfo.postman = {
                name: postmanNameDiv.text().trim() || null,
                image_url: `https://tracking.post.ir${postmanImg.attr('src')}` || null,
              };
            }
          }
        }
  
        trackingInfo.push(stepInfo);
      }
    });
  
    // Extract parcel info
    const parcelInfo = {
      contents: getNextText("محتویات مرسوله :"),
      service_type: getNextText("نوع سرویس :"),
      origin_post_office: getNextText("دفتر پستی مبداء:"),
      origin: getNextText("مبدا:"),
      destination: getNextText("مقصد :"),
      sender: getNextText("نام فرستنده :"),
      receiver: getNextText("نام گیرنده :"),
      weight: getNextText("وزن :"),
      postal_cost: getNextText("هزینه پستی :"),
      tax: getNextText("ماليات بر ارزش افزوده :") || getNextText("مالیات بر ارزش افزوده :"),
      total_postal_cost: getNextText("هزينه پستي (با ماليات) :"),
    };
  
    // Return the data
    return {
      success: true,
      tracking_number: trackingNumber,
      tracking_info: trackingInfo,
      parcel_info: parcelInfo,
    };
  }