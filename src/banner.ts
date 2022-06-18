import chalk from "chalk";
// echo SubGenius | figlet | tr '\\' '*' >> src/banner.ts

export const subgeniusBanner = `
 ____        _      ____            _           
/ ___| _   _| |__  / ___| ___ _ __ (_)_   _ ___ 
*___ *| | | | '_ *| |  _ / _ * '_ *| | | | / __|
 ___) | |_| | |_) | |_| |  __/ | | | | |_| *__ *
|____/ *__,_|_.__/ *____|*___|_| |_|_|*__,_|___/
                                                
`.replaceAll('*', '\\');


// echo Subshell | figlet | tr '\\' '*' >> src/banner.ts
export const subshellBanner = `
 ____        _         _          _ _ 
/ ___| _   _| |__  ___| |__   ___| | |
*___ *| | | | '_ */ __| '_ * / _ * | |
 ___) | |_| | |_) *__ * | | |  __/ | |
|____/ *__,_|_.__/|___/_| |_|*___|_|_|
                                       
`.replaceAll('*', '\\');

export const subshellBannerRight = `
 ____        _         _          _ _    __          
/ ___| _   _| |__  ___| |__   ___| | |   * *         
*___ *| | | | '_ */ __| '_ * / _ * | |    * * 
 ___) | |_| | |_) *__ * | | |  __/ | |    / / _____ 
|____/ *__,_|_.__/|___/_| |_|*___|_|_|   /_/ |_____|       

`.replaceAll('*', '\\');
                                                    
export const subshellBannerLeft = `
 __            ____        _         _          _ _  
 * *          / ___| _   _| |__  ___| |__   ___| | | 
  * *         *___ *| | | | '_ */ __| '_ * / _ * | | 
  / / _____    ___) | |_| | |_) *__ * | | |  __/ | | 
 /_/ |_____|  |____/ *__,_|_.__/|___/_| |_|*___|_|_|       
                                                      
`.replaceAll('*', '\\');

export function showAsciiBanner() {
  //console.log(chalk.blue(await figlet("SubGenius")));
  if (process.stdout.columns > 54) {
    console.log(chalk.blue(subshellBannerRight));
  } else if (process.stdout.columns >= 40 ) {
    console.log(chalk.blue(subshellBanner));
  }
}
