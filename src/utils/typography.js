import Typography from "typography"
import TypographyTheme from "typography-theme-stern-grove"

const BaseFontSize = 18
const FontToCodeRatio = .8

TypographyTheme.baseFontSize = `${BaseFontSize}px`
TypographyTheme.overrideThemeStyles = ({ scale, adjustFontSizeTo }, options) => ({
  code: {
    fontSize: `${BaseFontSize * FontToCodeRatio}px !important`,
    lineHeight: `${options.baseLineHeight * FontToCodeRatio} !important`
  },
})

const typography = new Typography(TypographyTheme)

// Hot reload typography in development.
if (process.env.NODE_ENV !== `production`) {
  typography.injectStyles()
}

export default typography
export const rhythm = typography.rhythm
export const scale = typography.scale
