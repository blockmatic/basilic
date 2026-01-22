import { Body, Container, Heading, Link, Preview, Section, Text } from '@react-email/components'
import { cn } from '@repo/ui/lib/utils'
import { format, isValid, parseISO } from 'date-fns'
import { Footer } from '../components/footer'
import { Logo } from '../components/logo'
import {
  Button,
  EmailThemeProvider,
  getEmailInlineStyles,
  getEmailThemeClasses,
} from '../components/theme'

const formatTransactionDate = (date: string): string => {
  try {
    const parsed = parseISO(date)
    if (isValid(parsed)) {
      return format(parsed, 'MMM d')
    }
    return '—'
  } catch {
    return '—'
  }
}

interface Transaction {
  id: string
  date: string
  amount: number
  name: string
  currency: string
  category?: string
}

interface Props {
  fullName: string
  transactions: Transaction[]
  teamName: string
}

const defaultTransactions = [
  {
    id: '1',
    date: new Date().toISOString(),
    amount: -1000,
    currency: 'USD',
    name: 'Spotify',
  },
  {
    id: '2',
    date: new Date().toISOString(),
    amount: 1000,
    currency: 'USD',
    name: 'H23504959',
    category: 'income',
  },
  {
    id: '3',
    date: new Date().toISOString(),
    amount: -1000,
    currency: 'USD',
    name: 'Webflow',
  },
  {
    id: '4',
    date: new Date().toISOString(),
    amount: -1000,
    currency: 'USD',
    name: 'Netflix',
  },
  {
    id: '5',
    date: new Date().toISOString(),
    amount: -2500,
    currency: 'USD',
    name: 'Adobe Creative Cloud',
  },
  {
    id: '6',
    date: new Date().toISOString(),
    amount: -1499,
    currency: 'USD',
    name: 'Amazon Prime',
  },
  {
    id: '7',
    date: new Date().toISOString(),
    amount: -999,
    currency: 'USD',
    name: 'Disney+',
  },
  {
    id: '8',
    date: new Date().toISOString(),
    amount: -1299,
    currency: 'USD',
    name: 'Microsoft 365',
  },
  {
    id: '9',
    date: new Date().toISOString(),
    amount: -899,
    currency: 'USD',
    name: 'Apple Music',
  },
  {
    id: '10',
    date: new Date().toISOString(),
    amount: -1599,
    currency: 'USD',
    name: 'HBO Max',
  },
  {
    id: '11',
    date: new Date().toISOString(),
    amount: -1999,
    currency: 'USD',
    name: 'Adobe Photoshop',
  },
  {
    id: '12',
    date: new Date().toISOString(),
    amount: -799,
    currency: 'USD',
    name: 'YouTube Premium',
  },
  {
    id: '13',
    date: new Date().toISOString(),
    amount: -1499,
    currency: 'USD',
    name: 'Dropbox Plus',
  },
  {
    id: '14',
    date: new Date().toISOString(),
    amount: -999,
    currency: 'USD',
    name: 'Nintendo Online',
  },
  {
    id: '15',
    date: new Date().toISOString(),
    amount: -1299,
    currency: 'USD',
    name: 'Slack',
  },
]

export const TransactionsEmail = ({
  fullName = '',
  transactions = defaultTransactions,
  teamName = '',
}: Props): React.ReactElement => {
  const hasAppUrl = Boolean(process.env.APP_URL)
  const baseAppUrl = process.env.APP_URL || ''
  const firstName = fullName ? fullName.split(' ').at(0) : ''
  const themeClasses = getEmailThemeClasses()
  const lightStyles = getEmailInlineStyles('light')
  const count = transactions.length
  const plural = count > 1

  const previewText = `${firstName ? `Hi ${firstName}, ` : ''}You have ${count} ${plural ? 'new transactions' : 'new transaction'}`

  const displayedTransactions = transactions.slice(0, 10)

  return (
    <EmailThemeProvider preview={<Preview>{previewText}</Preview>}>
      <Body className={`my-auto mx-auto font-sans ${themeClasses.body}`} style={lightStyles.body}>
        <Container
          className={`my-[40px] mx-auto p-[20px] max-w-[600px] ${themeClasses.container}`}
          style={{
            borderStyle: 'solid',
            borderWidth: 1,
            borderColor: lightStyles.container.borderColor,
          }}
        >
          <Logo />
          <Heading
            className={`text-[21px] font-normal text-center p-0 my-[30px] mx-0 ${themeClasses.heading}`}
            style={{ color: lightStyles.text.color }}
          >
            You have{' '}
            <span className="font-semibold">
              {count} {plural ? 'new transactions' : 'new transaction'}{' '}
            </span>
          </Heading>
          <Text
            className={`text-[14px] leading-[24px] ${themeClasses.text}`}
            style={{ color: lightStyles.text.color }}
          >
            {firstName ? `Hi ${firstName}` : 'Hello'},
            <br />
            <br />
            We found{' '}
            <span className="font-semibold">
              {count} {plural ? 'new transactions' : 'new transaction'}{' '}
            </span>
            {teamName ? `for your team ${teamName}` : 'for your account'}. We&apos;ll automatically
            match them against receipts in your inbox, or you can simply reply to this email with
            the receipts.
          </Text>

          <br />

          <table
            style={{ width: '100% !important', minWidth: '100%' }}
            className="border-collapse w-full"
          >
            <thead style={{ width: '100%' }}>
              <tr
                className={`border-0 border-t-[1px] border-b-[1px] border-solid h-[45px] ${themeClasses.border}`}
                style={{ borderColor: lightStyles.container.borderColor }}
              >
                <th align="left">
                  <Text
                    className={`text-[14px] font-semibold m-0 p-0 ${themeClasses.text}`}
                    style={{ color: lightStyles.text.color }}
                  >
                    Date
                  </Text>
                </th>
                <th align="left" style={{ width: '50%' }}>
                  <Text
                    className={`text-[14px] font-semibold m-0 p-0 ${themeClasses.text}`}
                    style={{ color: lightStyles.text.color }}
                  >
                    Description
                  </Text>
                </th>
                <th align="left">
                  <Text
                    className={`text-[14px] font-semibold m-0 p-0 ${themeClasses.text}`}
                    style={{ color: lightStyles.text.color }}
                  >
                    Amount
                  </Text>
                </th>
              </tr>
            </thead>

            <tbody style={{ width: '100%', minWidth: '100% !important' }}>
              {displayedTransactions.map(transaction => (
                <tr
                  key={transaction.id}
                  className={`border-0 border-b-[1px] border-solid h-[45px] ${themeClasses.border}`}
                  style={{ borderColor: lightStyles.container.borderColor }}
                >
                  <td align="left">
                    <Text
                      className={`text-[14px] m-0 p-0 mt-1 pb-1 ${themeClasses.text}`}
                      style={{ color: lightStyles.text.color }}
                    >
                      {formatTransactionDate(transaction.date)}
                    </Text>
                  </td>
                  <td align="left" style={{ width: '50%' }}>
                    {hasAppUrl ? (
                      <Link
                        href={`${baseAppUrl}/transactions?id=${transaction.id}`}
                        className={cn(
                          transaction.amount > 0 ? 'text-[#00C969]' : themeClasses.link,
                        )}
                        style={{
                          color:
                            transaction.amount > 0 ? '#00C969 !important' : lightStyles.text.color,
                          textDecoration: 'none',
                        }}
                      >
                        <Text
                          className="text-[14px] m-0 p-0 mt-1 pb-1 line-clamp-1"
                          style={{
                            color: transaction.amount > 0 ? '#00C969 !important' : 'inherit',
                          }}
                        >
                          {transaction.name}
                        </Text>
                      </Link>
                    ) : (
                      <Text
                        className={cn(
                          'text-[14px] m-0 p-0 mt-1 pb-1 line-clamp-1',
                          transaction.amount > 0 ? 'text-[#00C969]' : themeClasses.text,
                        )}
                        style={{
                          color:
                            transaction.amount > 0 ? '#00C969 !important' : lightStyles.text.color,
                        }}
                      >
                        {transaction.name}
                      </Text>
                    )}
                  </td>
                  <td align="left">
                    <Text
                      className={cn(
                        'text-[14px] m-0 p-0 mt-1 pb-1',
                        transaction.amount > 0 ? 'text-[#00C969]' : themeClasses.text,
                      )}
                      style={{
                        color:
                          transaction.amount > 0 ? '#00C969 !important' : lightStyles.text.color,
                      }}
                    >
                      {Intl.NumberFormat(undefined, {
                        style: 'currency',
                        currency: transaction.currency,
                      }).format(transaction.amount)}
                    </Text>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          <br />

          {transactions.length > 0 &&
          transactions[transactions.length - 1]?.date &&
          transactions.at(0)?.date ? (
            <Section className="text-center mt-[32px] mb-[32px]">
              {hasAppUrl ? (
                <Button
                  href={`${baseAppUrl}/transactions?start=${transactions[transactions.length - 1]?.date}&end=${transactions.at(0)?.date}`}
                >
                  View transactions
                </Button>
              ) : (
                <Text
                  className={`text-[14px] ${themeClasses.text}`}
                  style={{ color: lightStyles.text.color }}
                >
                  View transactions
                </Text>
              )}
            </Section>
          ) : null}

          <br />
          <Footer />
        </Container>
      </Body>
    </EmailThemeProvider>
  )
}

export default TransactionsEmail
