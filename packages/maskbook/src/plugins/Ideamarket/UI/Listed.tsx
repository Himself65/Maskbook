import { makeStyles, Typography, Button, Link, Divider, Box } from '@material-ui/core'
import type { SetStateAction } from 'react'
const test = makeStyles({})

const useStyles = makeStyles((theme) => ({
    root: {
        display: 'block',
        width: '160px',
        borderRadius: '10px',
        boxShadow: '0px 0px 3px 1px #ADADAD',
        marginRight: '10%',
        overflow: 'hidden',
    },
    topInfo: {
        display: 'flex',
    },

    topText: {
        marginTop: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
        color: theme.palette.text.primary,
    },

    topBox: {
        display: 'flex',
        flexDirection: 'column',
        width: '50%',
        alignItems: 'center',
        justifyContent: 'center',
        backgroundColor: theme.palette.mode === 'light' ? 'white' : null,
    },

    rankText: {
        color: 'gray',
        marginBottom: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
        fontSize: 12,
    },

    priceText: {
        marginBottom: theme.spacing(1),
        marginRight: theme.spacing(1),
        marginLeft: theme.spacing(1),
        fontSize: 13,
    },

    listButton: {
        backgroundColor: '#2946ba',
        borderRadius: '10px',
        margin: theme.spacing(1),
        width: '53%',
    },

    buttonText: {
        textTransform: 'none',
        color: 'white',
    },
    bottomText: {
        fontSize: [12, '!important'],
        color: 'black',
    },
}))

interface ListedProps {
    username: string
    rank: number
    price: string
    dayChange: number
    setExtendedHover: Dispatch<SetStateAction<boolean>>
}

export default function Listed(props: ListedProps) {
    const classes = useStyles()

    const isPositive = props.dayChange >= 0

    return (
        <div
            className={classes.root}
            onMouseEnter={() => props.setExtendedHover(true)}
            onMouseLeave={() =>
                setTimeout(() => {
                    props.setExtendedHover(false)
                }, 200)
            }>
            <div className={classes.topInfo}>
                <Box className={classes.topBox}>
                    <Typography className={classes.topText}>
                        <b>{props.rank}</b>
                    </Typography>
                    <Typography className={classes.rankText}>Rank</Typography>
                </Box>
                <Divider orientation="vertical" />
                <Box className={classes.topBox}>
                    <Typography className={classes.topText}>
                        <b>${props.price}</b>
                    </Typography>
                    <Typography className={classes.priceText} style={{ color: isPositive ? 'green' : 'red' }}>
                        {isPositive ? '+' : null}
                        {props.dayChange}
                    </Typography>
                </Box>
            </div>

            <Divider />
            <Box display="flex" sx={{ backgroundColor: '#f7f7f7' }} justifyContent="center">
                <Link
                    href={`https://ideamarket.io/i/twitter/${props.username}`}
                    target="_blank"
                    rel="noopener"
                    style={{ textDecoration: 'none' }}>
                    <Button className={classes.listButton}>
                        <Typography className={classes.buttonText}>Buy</Typography>
                    </Button>
                </Link>
            </Box>
        </div>
    )
}
